import dotenv from "dotenv";
dotenv.config({ override: true });
import OpenAI from "openai";
import { getFS } from "../helpers/utils";
import { XMTPContext } from "../lib/xmtp";
import { getUserInfo, replaceUserContext } from "./resolver";
import type { Agent } from "../helpers/types";
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
  private static instance: ChatMemory;

  private constructor() {}

  // Ensure singleton pattern
  public static getInstance(): ChatMemory {
    if (!ChatMemory.instance) {
      ChatMemory.instance = new ChatMemory();
    }
    return ChatMemory.instance;
  }

  getHistory(key: string): ChatHistoryEntry[] {
    const normalizedKey = key.toLowerCase();
    return this.histories[normalizedKey];
  }

  addEntry(
    key: string,
    message: string,
    who: "user" | "assistant" | "system",
  ): ChatHistoryEntry[] {
    if (!key || !message) {
      console.log(key, message);
      console.warn("Invalid entry attempt - missing key or message");
      return [];
    }
    const normalizedKey = key.toLowerCase();
    if (!this.getHistory(normalizedKey)) {
      return [];
    }

    this.histories[normalizedKey].push({
      role: who,
      content: message,
    });

    return this.getHistory(normalizedKey);
  }
  createMemory(key: string, systemPrompt: string) {
    this.histories[key.toLowerCase()] = [];
    this.addEntry(key.toLowerCase(), systemPrompt, "system");
  }
  initMemory(key: string, systemPrompt: string, userPrompt: string) {
    const history = this.getHistory(key.toLowerCase());
    if (!history) {
      this.createMemory(key.toLowerCase(), systemPrompt);
      this.addEntry(key.toLowerCase(), userPrompt, "user");
      return this.getHistory(key.toLowerCase());
    } else return history;
  }

  clear(key?: string) {
    if (key) {
      const normalizedKey = key.toLowerCase();
      console.log(`Clearing memory for specific key: ${normalizedKey}`);
      delete this.histories[normalizedKey];
    } else {
      console.log("Clearing all memory");
      this.histories = {};
    }
  }
}

// Modify singleton export to use getInstance
export const chatMemory = ChatMemory.getInstance();

export const COMMON_ISSUES = `# Common Issues

1. Missing commands in responses
  **Example 1**:
    User: check vitalik.eth
    Incorrect:
    > "Looks like vitalik.eth is registered! What about these cool alternatives?"
    Correct:
    > /cool vitalik.eth"
  **Example 2**:
    User: check my balance
    Incorrect:
    > "Let's see what your balance is saying now, ArizonaOregon! Here we go:"
    Correct:
    > /balance"
`;
export const PROMPT_RULES = `# Rules
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
  let vibe =
    "You are a helpful agent called {agent_name} that lives inside a web3 messaging app called Converse.";
  if (agent?.vibe) {
    let params = agent.vibe;
    // Construct a more detailed personality description from the vibe object
    vibe = `You are ${params.vibe} agent called {agent_name} that lives inside a web3 messaging app called Converse.\n\n`;
    if (params.description) {
      vibe += `Vibe: ${params.description}`;
    }
    if (params.tone) {
      vibe += `Tone: ${params.tone}`;
    }
    if (params.style) {
      vibe += `Style: ${params.style}`;
    }
    if (params.quirks && params.quirks.length > 0) {
      vibe += `Quirks: ${params.quirks.join(", ")}`;
    }
  }

  prompt = prompt.replace("{vibe}", vibe);
  prompt = prompt.replace("{rules}", PROMPT_RULES);
  prompt = prompt.replace("{skills}", replaceSkills(agent));
  prompt = prompt.replace("{issues}", COMMON_ISSUES);
  prompt = prompt.replace("{agent_name}", agent?.tag);

  // Replace variables in the system prompt
  if (userInfo) {
    prompt = prompt.replace("{user_context}", replaceUserContext(userInfo));
    prompt = prompt.replaceAll("{address}", userInfo.address || "");
    prompt = prompt.replaceAll("{domain}", userInfo.ensDomain || "");
    prompt = prompt.replaceAll("{username}", userInfo.converseUsername || "");
    prompt = prompt.replaceAll("{name}", userInfo.preferredName || "");
  }

  const { fs } = getFS();
  if (fs) {
    fs.writeFileSync("example_prompt.md", prompt);
  }
  return prompt;
}
// [!endregion replaceVariables]
export async function agentParse(
  key: string,
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
    const { reply } = await textGeneration(key, userPrompt, systemPrompt);
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
      context.getConversationKey() + ":" + sender.address,
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
  key: string,
  userPrompt: string,
  systemPrompt: string = "",
) {
  // Early validation
  if (!openai) {
    return { reply: "No OpenAI API key found in .env" };
  }

  const messages = chatMemory.initMemory(key, systemPrompt, userPrompt);

  try {
    const response = await openai.chat.completions.create({
      model: (process.env.GPT_MODEL as string) || "gpt-4o",
      messages: messages,
    });

    const reply =
      response.choices[0].message.content ?? "No response from OpenAI.";
    const cleanedReply = parseMarkdown(reply);

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
    chatMemory.clear();
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
        //chatMemory.addEntry(memoryKey, msg, "assistant");
        // Send the response message
        await context.send(msg);
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
