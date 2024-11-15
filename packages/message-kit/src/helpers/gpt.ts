import "dotenv/config";
import type { SkillGroup } from "./types";
import OpenAI from "openai";
import { findSkillGroupByTag } from "../lib/skills";
import { HandlerContext } from "../lib/handlerContext";
import {
  getUserInfo,
  PROMPT_REPLACE_VARIABLES,
  PROMPT_USER_CONTENT,
} from "./resolver";

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

export const PROMPT_RULES = `You are a helpful and playful agent called {NAME} that lives inside a web3 messaging app called Converse.
- You can respond with multiple messages if needed. Each message should be separated by a newline character.
- You can trigger skills by only sending the command in a newline message.
- Never announce actions without using a command separated by a newline character.
- Dont answer in markdown format, just answer in plaintext.
- Do not make guesses or assumptions
- Only answer if the verified information is in the prompt.
- Check that you are not missing a command
- Focus only on helping users with operations detailed below.
`;

export function PROMPT_SKILLS_AND_EXAMPLES(skills: SkillGroup[], tag: string) {
  let skillGroup = findSkillGroupByTag(tag, skills);

  let returnPrompt = `\nSkills:\n${skillGroup?.skills
    .map((skill) => skill.skill)
    .join("\n")}\n\nExamples:\n${skillGroup?.skills
    .map((skill) => skill.examples?.join("\n"))
    .join("\n")}`;
  returnPrompt += "\n";
  return returnPrompt;
}
export async function defaultPromptTemplate(
  fineTuning: string,
  senderAddress: string,
  skills: SkillGroup[],
  tag: string,
) {
  // Fetch user information based on the sender's address
  const userInfo = await getUserInfo(senderAddress.toLowerCase());
  if (!userInfo) {
    console.log("User info not found");
    return;
  }

  // Construct the initial system prompt with rules, user content, and skills/examples
  let systemPrompt =
    PROMPT_RULES +
    PROMPT_USER_CONTENT(userInfo) +
    PROMPT_SKILLS_AND_EXAMPLES(skills, tag);

  // Add the fine-tuning to the system prompt
  systemPrompt += fineTuning;

  // Replace the variables in the system prompt
  systemPrompt = PROMPT_REPLACE_VARIABLES(
    systemPrompt,
    userInfo?.address ?? "",
    userInfo,
    tag,
  );

  // Return the final system prompt
  return systemPrompt;
}
export async function agentParse(
  prompt: string,
  senderAddress: string,
  systemPrompt?: string,
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
      model: "gpt-4",
      messages,
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
  context: HandlerContext,
) {
  if (!memoryKey) {
    clearMemory();
  }
  let messages = reply
    .split("\n")
    .map((message: string) => parseMarkdown(message))
    .filter((message): message is string => message.length > 0);

  console.log(messages);
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
