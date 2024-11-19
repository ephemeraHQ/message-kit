import dotenv from "dotenv";
dotenv.config({ override: true });
import { findSkillGroupByTag } from "../lib/skills";
import OpenAI from "openai";
import { XMTPContext } from "../lib/xmtp";
import { getUserInfo, replaceUserContext } from "./resolver";
import type { SkillGroup } from "./types";

const isOpenAIConfigured = () => {
  return !!process.env.OPEN_AI_API_KEY;
};

// Modify OpenAI initialization to be conditional
const openai = isOpenAIConfigured()
  ? new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY })
  : null;

type ChatHistoryEntry = {
  role: "user" | "assistant" | "system"; // restrict roles to valid options
  content: string;
};

type ChatHistories = Record<string, ChatHistoryEntry[]>;
// New ChatMemory class
class ChatMemory {
  private histories: ChatHistories = {};

  getHistory(address: string): ChatHistoryEntry[] {
    return this.histories[address] || [];
  }

  addEntry(address: string, entry: ChatHistoryEntry) {
    if (!this.histories[address]) {
      this.histories[address] = [];
    }
    this.histories[address].push(entry);
  }

  initializeWithSystem(address: string, systemPrompt: string) {
    if (this.getHistory(address).length === 0) {
      this.addEntry(address, {
        role: "system",
        content: systemPrompt,
      });
    }
  }

  clear(address?: string) {
    if (address) {
      this.histories[address] = [];
    } else {
      this.histories = {};
    }
  }
}

// Create singleton instance
export const chatMemory = new ChatMemory();

export const clearMemory = (address?: string) => {
  chatMemory.clear(address);
};

export const PROMPT_RULES = `
# Rules
- You can respond with multiple messages if needed. Each message should be separated by a newline character.
- You can trigger skills by only sending the command in a newline message.
- Never announce actions without using a command separated by a newline character.
- Dont answer in markdown format, just answer in plaintext.
- Do not make guesses or assumptions
- Only answer if the verified information is in the prompt.
- Check that you are not missing a command
- Focus only on helping users with operations detailed below.
`;

export function replaceSkills(skills: SkillGroup[], tag: string) {
  let skillGroup = findSkillGroupByTag(tag, skills);
  if (skillGroup) {
    let returnPrompt = `## Commands\n${skillGroup?.skills
      .map((skill) => skill.skill)
      .join("\n")}\n\n### Examples\n${skillGroup?.skills
      .map((skill) => skill.examples?.join("\n"))
      .join("\n")}`;
    return returnPrompt;
  } else {
    return "## Commands\n- No commands found\n- Don't make up commands\n- If you don't know the answer, just say so, concisely.\n";
  }
}

// [!region replaceVariables]
export async function replaceVariables(
  prompt: string,
  senderAddress: string,
  skills: SkillGroup[] | undefined,
  tag: string,
) {
  // Fetch user information based on the sender's address
  let userInfo = await getUserInfo(senderAddress);
  if (!userInfo) {
    console.log("User info not found");
    userInfo = {
      preferredName: senderAddress,
      address: senderAddress,
      ensDomain: senderAddress,
      converseUsername: senderAddress,
    };
  }

  prompt = prompt.replace(
    "{persona}",
    "You are a helpful agent called {agent_name} that lives inside a web3 messaging app called Converse.",
  );

  prompt = prompt.replace("{agent_name}", tag);
  prompt = prompt.replace("{rules}", PROMPT_RULES);
  prompt = prompt.replace("{skills}", replaceSkills(skills ?? [], tag));

  // Replace variables in the system prompt
  if (userInfo) {
    prompt = prompt.replace("{user_context}", replaceUserContext(userInfo));
    prompt = prompt.replaceAll("{address}", userInfo.address || "");
    prompt = prompt.replaceAll("{ens_domain}", userInfo.ensDomain || "");
    prompt = prompt.replaceAll("{username}", userInfo.converseUsername || "");
    prompt = prompt.replaceAll("{name}", userInfo.preferredName || "");
  }

  if (process.env.MSG_LOG === "true") {
    console.log("System Prompt", prompt);
  }
  return prompt;
}
// [!endregion replaceVariables]
export async function agentParse(
  prompt: string,
  senderAddress: string,
  systemPrompt: string,
) {
  try {
    let userPrompt = prompt;
    const userInfo = await getUserInfo(senderAddress);
    if (!userInfo) {
      console.log("User info not found");
      return;
    }
    const { reply } = await textGeneration(
      senderAddress,
      userPrompt,
      systemPrompt,
    );
    return reply;
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    throw error;
  }
}
export async function agentReply(context: XMTPContext, systemPrompt?: string) {
  const {
    message: {
      content: { text, params },
      sender,
    },
  } = context;

  try {
    let userPrompt = params?.prompt ?? text;

    const { reply } = await textGeneration(
      sender.address,
      userPrompt,
      systemPrompt,
    );
    await processMultilineResponse(sender.address, reply, context);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.send("An error occurred while processing your request.");
  }
}
export async function textGeneration(
  memoryKey: string,
  userPrompt: string,
  systemPrompt?: string,
) {
  // Early validation
  if (!openai) {
    return { reply: "No OpenAI API key found in .env" };
  }

  // Handle memory management
  if (!memoryKey) clearMemory();

  // Initialize or get chat history
  chatMemory.initializeWithSystem(memoryKey, systemPrompt ?? "");
  let messages = chatMemory.getHistory(memoryKey);

  // Add user's prompt
  messages.push({ role: "user", content: userPrompt });

  try {
    // Make OpenAI API call
    const response = await openai.chat.completions.create({
      model: (process.env.GPT_MODEL as string) || "gpt-4o",
      messages: messages,
    });

    const reply =
      response.choices[0].message.content ?? "No response from OpenAI.";
    const cleanedReply = parseMarkdown(reply);

    // Update chat memory
    chatMemory.addEntry(memoryKey, {
      role: "assistant",
      content: cleanedReply,
    });

    return { reply: cleanedReply, history: messages };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate response");
  }
}
export async function processMultilineResponse(
  memoryKey: string,
  reply: string,
  context: XMTPContext,
) {
  if (!memoryKey) {
    clearMemory();
  }
  let messages = reply
    .split("\n")
    .map((message: string) => parseMarkdown(message))
    .filter((message): message is string => message.length > 0);

  console.log(messages);
  // [!region processing]
  for (const message of messages) {
    if (message.startsWith("/")) {
      const response = await context.executeSkill(message);
      if (response && typeof response.message === "string") {
        let msg = parseMarkdown(response.message);
        chatMemory.addEntry(memoryKey, {
          role: "system",
          content: msg,
        });
        await context.send(response.message);
      }
    } else {
      await context.send(message);
    }
  }
  // [!endregion processing]
}
export function parseMarkdown(message: string) {
  let trimmedMessage = message;
  // Remove bold and underline markdown
  trimmedMessage = trimmedMessage?.replace(/(\*\*|__)(.*?)\1/g, "$2");
  // Remove markdown links, keeping only the URL
  trimmedMessage = trimmedMessage?.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2");
  // Remove markdown headers
  trimmedMessage = trimmedMessage?.replace(/^#+\s*(.*)$/gm, "$1");
  // Remove inline code formatting
  trimmedMessage = trimmedMessage?.replace(/`([^`]+)`/g, "$1");
  // Remove single backticks at the start or end of the message
  trimmedMessage = trimmedMessage?.replace(/^`|`$/g, "");
  // Remove leading and trailing whitespace
  trimmedMessage = trimmedMessage?.replace(/^\s+|\s+$/g, "");
  // Remove any remaining leading or trailing whitespace
  trimmedMessage = trimmedMessage.trim();

  return trimmedMessage;
}
