import dotenv from "dotenv";
dotenv.config({ override: true });
import OpenAI from "openai";
import { getFS } from "../helpers/utils";
import type { Context } from "../lib/core";
import { getUserInfo } from "./resolver";
import type { Agent } from "../helpers/types";
import { replaceSkills } from "../lib/skills";

const isOpenAIConfigured = () => {
  return !!process.env.OPENAI_API_KEY;
};

// Modify OpenAI initialization to be conditional
const openai = isOpenAIConfigured()
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : undefined;

export type ChatHistoryEntry = {
  role: "user" | "assistant" | "system"; // restrict roles to valid options
  content: string;
};

type ChatHistories = Record<string, ChatHistoryEntry[]>;
// [!region memory]
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
    //console.log("addEntry", this.getHistory(normalizedKey));
    return this.getHistory(normalizedKey);
  }
  createMemory(key: string, systemPrompt: string) {
    const history = this.getHistory(key.toLowerCase());
    if (!history) {
      this.histories[key.toLowerCase()] = [];
      this.addEntry(key.toLowerCase(), systemPrompt, "system");
      return this.getHistory(key.toLowerCase());
    } else {
      return history;
    }
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
// [!endregion memory]
export const defaultIntro =
  "You are a helpful agent called {agent_name} that lives inside a web3 messaging app called";
export const defaultSystemPrompt = `{intro}\n{vibe}\n{rules}\n{user_context}\n{skills}`;
// [!region PROMPT_RULES]
export const PROMPT_RULES = `# Rules
- You can respond with multiple messages if needed. Each message should be separated by a newline character.
- You can trigger skills by only sending the command in a newline message.
- Each command starts with a slash (/).
- Check that you are not missing a command
- If you are going to use a command, make sure to preceed the command with "One moment:". i.e "Sure! ill check that for you. One moment:\n/check humanagent.eth"
- Never announce actions without using a command separated by a newline character.
- Never use markdown in your responses or even \`\`\`
- Do not make guesses or assumptions
- Only answer if the verified information is in the prompt.
- Focus only on helping users with operations detailed below.
- Date: ${new Date().toUTCString()},
`;
// [!endregion PROMPT_RULES]
// [!region parsePrompt]
export async function parsePrompt(
  prompt: string,
  senderAddress: string,
  agent: Agent,
) {
  prompt = prompt.replace("{intro}", agent?.intro ?? defaultIntro);
  prompt = prompt.replace("{vibe}", parseVibe(agent) + "\n");
  prompt = prompt.replace("{rules}", PROMPT_RULES + "\n");
  prompt = prompt.replace("{skills}", replaceSkills(agent) + "\n");
  prompt = prompt.replace("{agent_name}", agent?.tag);
  prompt = prompt.replace(
    "{user_context}",
    (await parseUserContext(senderAddress)) + "\n",
  );

  const { fs } = getFS();
  if (fs) {
    //This is for debugging
    fs.writeFileSync("example_prompt.md", prompt);
  }
  return prompt;
}

export const parseUserContext = async (senderAddress: string) => {
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
  let { address, ensDomain, converseUsername, preferredName } = userInfo;

  let prompt = `## User context
- Start by fetch their domain from or Converse username
- Call the user by their name or domain, in case they have one
- Ask for a name (if they don't have one) so you can suggest domains.
- Message sent date: ${new Date().toISOString()}
- Users address is: ${address}`;
  if (preferredName) prompt += `\n- Users name is: ${preferredName}`;
  if (ensDomain) prompt += `\n- User ENS domain is: ${ensDomain}`;
  if (converseUsername)
    prompt += `\n- Converse username is: ${converseUsername}`;

  prompt = prompt.replaceAll("{address}", userInfo.address || "");
  prompt = prompt.replaceAll("{domain}", userInfo.ensDomain || "");
  prompt = prompt.replaceAll("{username}", userInfo.converseUsername || "");
  prompt = prompt.replaceAll("{name}", userInfo.preferredName || "");

  return prompt;
};
// [!endregion parsePrompt]
export function parseVibe(agent: Agent) {
  let vibe = "";
  if (agent?.vibe) {
    let params = agent.vibe;
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
  return vibe;
}
// [!region agentReply]
export async function agentReply(context: Context) {
  const {
    message: {
      content: { text, params },
      sender,
    },
    agent,
  } = context;

  try {
    // Parse the system prompt using the agent's system prompt or the default one
    let systemPrompt = await parsePrompt(
      agent.systemPrompt || defaultSystemPrompt,
      sender.address,
      agent,
    );

    // Use the provided prompt from params or fallback to the message text
    let userPrompt = params?.prompt ?? text;

    //Memory
    let memoryKey = context.getMemoryKey(
      sender.address,
      context.conversation.id,
    );
    chatMemory.createMemory(memoryKey, systemPrompt);
    chatMemory.addEntry(memoryKey, userPrompt, "user");

    // Generate a reply using the text generation function
    const { reply } = await textGeneration(userPrompt, systemPrompt, memoryKey);

    let messages = reply
      .split("\n")
      .map((message: string) => parseMarkdown(message))
      .filter((message): message is string => message.length > 0);
    console.log("reply", messages);

    // Process the generated reply and send it back to the user
    await processMultilineResponse(messages, context);
    return { reply };
  } catch (error) {
    // Log any errors that occur during the OpenAI call
    console.error("Error during OpenAI call:", error);
    // Inform the user that an error occurred
    await context.send({
      message: "An error occurred while processing your request.",
      originalMessage: context.message,
    });
    return { reply: "An error occurred while processing your request." };
  }
}
// [!endregion agentReply]

// [!region textGeneration]
export async function textGeneration(
  userPrompt: string,
  systemPrompt: string = "",
  memoryKey: string,
) {
  // Early validation
  if (!openai) {
    return { reply: "No OpenAI API key found in .env" };
  }

  try {
    let history = chatMemory.getHistory(memoryKey);
    if (history === undefined || history?.length === 0) {
      history = [{ role: "system", content: systemPrompt }];
      history.push({ role: "user", content: userPrompt });
    }
    const response = await openai.chat.completions.create({
      model: (process.env.GPT_MODEL as string) || "gpt-4o",
      messages: history,
    });

    const reply =
      response.choices[0].message.content ?? "No response from OpenAI.";

    let cleanedReply: string = await checkIntent(
      systemPrompt,
      userPrompt,
      reply,
    );
    cleanedReply = parseMarkdown(cleanedReply);
    return { reply: cleanedReply };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate response");
  }
}
// [!endregion textGeneration]

// [!region checkIntent]
export async function checkIntent(
  systemPrompt: string,
  userPrompt: string,
  reply: string,
  attempts: number = 0,
) {
  const MAX_ATTEMPTS = 10;
  const intentIndicators = [
    "moment",
    "let's",
    "i'll look up",
    "check",
    "checking",
    "searching",
    "hang",
    "wait",
  ];
  let intentDetected = intentIndicators.some((indicator) =>
    reply.toLowerCase().includes(indicator),
  );
  if (intentDetected) {
    const nonActionIndicators = ["need", "help", "?"];
    intentDetected = !nonActionIndicators.some((indicator) =>
      reply.toLowerCase().includes(indicator),
    );
  }
  const hasValidCommand = reply.includes("\n/") || reply.startsWith("/");

  if (attempts >= MAX_ATTEMPTS) {
    return "I apologize, but I'm having trouble processing your request correctly. Please try rephrasing your question or ask for a different task.";
  }

  if (intentDetected && !hasValidCommand) {
    console.log("reply", reply);
    const fixPrompt = `You indicated you would perform an action by saying "One moment" but didn't include the proper command. 
Your previous response was: "${reply}" to the users prompt: "${userPrompt}"
Please provide your response again with the exact command starting with / on a new line. 
Remember: Commands must be on their own line starting with /.`;

    const { reply: fixedReply } = await textGeneration(
      fixPrompt,
      systemPrompt,
      Math.random().toString(36).substring(2, 12),
    );

    // if (process.env.MSG_LOG === "true")
    console.log("Intent detected but missing command", {
      reply,
      fixPrompt,
      fixedReply,
    });

    if (!fixedReply.includes("/")) {
      return checkIntent(systemPrompt, userPrompt, fixedReply, attempts + 1);
    }

    return fixedReply;
  }

  return reply;
}
// [!endregion checkIntent]

// [!region processMultilineResponse]
export async function processMultilineResponse(
  messages: string[],
  context: Context,
): Promise<boolean> {
  try {
    // Continue with existing processing
    for (const message of messages) {
      if (message.startsWith("/")) {
        const response = await context.executeSkill(message);
        if (response && typeof response.message === "string") {
          let msg = parseMarkdown(response.message);

          await context.send({
            message: msg,
            receivers: [context.message.sender.address],
            originalMessage: context.message,
          });
        }
      } else {
        // If it's not a command and didn't match forbidden prefixes, it's probably valid free-form text
        await context.send({
          message: message,
          receivers: [context.message.sender.address],
          originalMessage: context.message,
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    return false;
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
  trimmedMessage = trimmedMessage.replace(/```/g, "");
  return trimmedMessage;
}
