import dotenv from "dotenv";
dotenv.config({ override: true });
import OpenAI from "openai";
import { getFS } from "./utils";
import { XMTPContext } from "../lib/xmtp";
import { getUserInfo, replaceUserContext } from "./resolver";
import type { Agent } from "./types";
import { replaceSkills } from "../lib/skills";

const isOpenAIConfigured = () => {
  return !!process.env.OPENAI_API_KEY;
};

// Modify OpenAI initialization to be conditional
const openai = isOpenAIConfigured()
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
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
export const COMMON_ISSUES = `
# Common Issues
1. Missing commands in responses
   **Issue**: Sometimes responses are sent without the required command.
   **Example**:
   Incorrect:
   > "Looks like vitalik.eth is registered! What about these cool alternatives?"
   Correct:
   > "Looks like vitalik.eth is registered! What about these cool alternatives?
   > /cool vitalik.eth"
   Incorrect:
   > Here is a summary of your TODOs. I will now send it via email.
   Correct:
   > /todo
`;
export const PROMPT_RULES = `
# Rules
- You can respond with multiple messages if needed. Each message should be separated by a newline character.
- You can trigger skills by only sending the command in a newline message.
- Each command starts with a slash (/).
- Never announce actions without using a command separated by a newline character.
- Never use markdown in your responses.
- Do not make guesses or assumptions
- Only answer if the verified information is in the prompt.
- Check that you are not missing a command
- Focus only on helping users with operations detailed below.
- Date: ${new Date().toUTCString()}
- When mentioning any action related to available skills, you MUST trigger the corresponding command in a new line
- If you suggest an action that has a command, you must trigger that command
`;

// [!region replaceVariables]
export async function replaceVariables(
  prompt: string,
  senderAddress: string,
  agent: Agent,
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

  prompt = prompt.replace("{agent_name}", agent?.tag);
  prompt = prompt.replace("{rules}", PROMPT_RULES);
  prompt = prompt.replace("{skills}", replaceSkills(agent));
  prompt = prompt.replace("{issues}", COMMON_ISSUES);

  // Replace variables in the system prompt
  if (userInfo) {
    prompt = prompt.replace("{user_context}", replaceUserContext(userInfo));
    prompt = prompt.replaceAll("{address}", userInfo.address || "");
    prompt = prompt.replaceAll("{domain}", userInfo.ensDomain || "");
    prompt = prompt.replaceAll("{username}", userInfo.converseUsername || "");
    prompt = prompt.replaceAll("{name}", userInfo.preferredName || "");
  }

  if (process.env.MSG_LOG === "true") {
    //console.log("System Prompt", prompt);
  }
  const { fs } = getFS();
  if (fs) {
    fs.writeFileSync("example_prompt.md", prompt);
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
  systemPrompt: string = "",
) {
  // Early validation
  if (!openai) {
    return { reply: "No OpenAI API key found in .env" };
  }
  let messages: ChatHistoryEntry[] = [];
  if (memoryKey) {
    // Initialize or get chat history
    chatMemory.initializeWithSystem(memoryKey, systemPrompt);
    messages = chatMemory.getHistory(memoryKey);
  }

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
    if (memoryKey) {
      chatMemory.addEntry(memoryKey, {
        role: "assistant",
        content: cleanedReply,
      });
      messages = chatMemory.getHistory(memoryKey);
    }

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
    // Check if the message is a command (starts with "/")
    if (message.startsWith("/")) {
      // Execute the skill associated with the command
      const response = await context.executeSkill(message);
      if (response && typeof response.message === "string") {
        // Parse the response message
        let msg = parseMarkdown(response.message);
        // Add the parsed message to chat memory as a system message
        chatMemory.addEntry(memoryKey, {
          role: "system",
          content: msg,
        });
        // Send the response message
        await context.send(response.message);
      }
    } else {
      // If the message is not a command, send it as is
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
