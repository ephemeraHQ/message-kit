import { Agent, SkillResponse } from "../helpers/types.js";
import { agentReply, chatMemory, defaultSystemPrompt } from "../plugins/gpt.js";
import { getUserInfo, userInfoCache } from "../plugins/resolver.js";
import { logInitMessage, logMessage } from "../helpers/utils.js";
import { Message, XMTP, createClient, Conversation } from "xmtp";

import { WalletService as CdpWalletService } from "../plugins/cdp.js";
import { WalletService as CircleWalletService } from "../plugins/circle.js";
import {
  executeSkill,
  parseSkill,
  findSkill,
  filterMessage,
} from "./skills.js";
import { logUserInteraction } from "../helpers/utils.js";
import type { AgentConfig } from "../helpers/types";
import { LocalStorage } from "../plugins/storage.js";

export function createAgent(
  agent: Agent,
): Agent & { run: () => Promise<void> } {
  let messageKit: MessageKit | null = null; // Ensure a single instance

  return {
    ...agent,
    async run() {
      if (!messageKit) {
        // Check if MessageKit is already initialized
        messageKit = new MessageKit(agent);
      }
      await messageKit.run();
    },
  };
}

export const awaitedHandlers = new Map<
  string,
  (text: string) => Promise<boolean | undefined>
>();

/* Context Interface */
export type Context = {
  message: Message;
  storage: LocalStorage;
  agentConfig?: AgentConfig;
  walletService: CdpWalletService | CircleWalletService;
  awaitingResponse: boolean;
  agent: Agent;
  executeSkill: (text: string) => Promise<SkillResponse | undefined>;
  clearMemory: (address?: string) => Promise<void>;
  clearCache: (address?: string) => Promise<void>;

  awaitResponse(
    prompt: string,
    validResponses?: string[],
    attempts?: number,
  ): Promise<string>;
  resetAwaitedState(): void;

  //XMTP
  xmtp: XMTP;
  conversation: Conversation;
  group: Conversation | undefined;
  getMemoryKey(): string;
  sendAgentMessage: (message: string, metadata: any) => Promise<void>;
  sendTo(message: string, receivers: string[]): Promise<void>;
  reply(message: string, reference?: string): Promise<void>;
  dm(message: string): Promise<void>;
  send(message: string): Promise<void>;
  sendImage(image: string): Promise<void>;
  react(emoji: string): Promise<void>;
  awaitedHandler: ((text: string) => Promise<boolean | void>) | undefined;
};

/* Context implementation */
export class MessageKit implements Context {
  xmtp!: XMTP;
  storage!: LocalStorage;
  message!: Message;
  conversation!: Conversation;
  group!: Conversation | undefined;
  agentConfig?: AgentConfig;
  walletService!: CdpWalletService | CircleWalletService;
  awaitingResponse: boolean = false;
  agent: Agent;

  executeSkill: (text: string) => Promise<SkillResponse | undefined> =
    async () => undefined;
  clearMemory: (address?: string) => Promise<void> = async () => {};
  clearCache: (address?: string) => Promise<void> = async () => {};
  awaitedHandler: ((text: string) => Promise<boolean | void>) | undefined =
    undefined;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  async run(): Promise<void> {
    // Initialize the clients
    this.xmtp = await createClient(
      this.handleMessage,
      this.agent.config?.client,
    );

    // Store the GPT model in process.env for global access
    process.env.GPT_MODEL = this.agent.config?.gptModel || "gpt-4o";
    logInitMessage(this.xmtp.client, this.agent);
  }
  static async create(
    message: Message,
    conversation: Conversation,
    agent: Agent,
    xmtp: XMTP,
  ): Promise<Context | undefined> {
    try {
      const context = new MessageKit(agent);
      xmtp.setMessage(message);
      context.xmtp = xmtp;
      context.message = message;
      //trim spaces from text
      if (message.typeId == "text") {
        const skillAction = findSkill(
          context.message.content.text as string,
          context?.agent?.skills ?? [],
        );
        if (skillAction) {
          const extractedValues = await parseSkill(
            context.message.content.text as string,
            skillAction,
          );
          if (extractedValues?.skill) {
            context.message.content = {
              ...context.message.content,
              ...extractedValues,
            };
            context.message.typeId = "skill";
          }
        }
      }

      if (message && message.id) {
        let userInfo = await getUserInfo(message.sender?.address);
        message.sender.username = userInfo?.converseUsername;
        message.sender.ensDomain = userInfo?.ensDomain;

        //Config
        context.agent = agent;
        context.agent.systemPrompt = agent.systemPrompt ?? defaultSystemPrompt;
        context.agentConfig = agent.config;
        context.group = message.group ?? undefined;
        context.conversation = conversation;
        context.clearMemory = async () => {
          await chatMemory.clear(message.sender?.address);
        };
        context.clearCache = async () => {
          await userInfoCache.clear(message.sender?.address);
        };
        context.executeSkill = async (text: string) => {
          const result = await executeSkill(
            text,
            context.agent,
            context as unknown as Context,
          );
          return result ?? undefined;
        };

        // Add interaction tracking
        logUserInteraction(message.sender?.address);

        //test
        if (context.agentConfig?.walletService === true) {
          if (
            process.env.COINBASE_API_KEY_NAME &&
            process.env.COINBASE_API_KEY_PRIVATE_KEY
          ) {
            if (process.env.MSG_LOG === "true")
              console.log("CDP Wallet Service Started");
            context.walletService = new CdpWalletService(
              context as unknown as Context,
            );
          } else if (process.env.CIRCLE_API_KEY) {
            if (process.env.MSG_LOG === "true")
              console.log("Circle Wallet Service Started");
            context.walletService = new CircleWalletService(
              context as unknown as Context,
            );
          }
        }
        context.storage = new LocalStorage(".data/storage");

        return context as Context;
      }
      return undefined;
    } catch (error) {
      console.error("Error creating Context:", error);
      return undefined;
    }
  }
  handleMessage = async (message: Message | undefined) => {
    try {
      if (!message) {
        console.warn("Received undefined message");
        return;
      }

      const context = await MessageKit.create(
        message,
        message.conversation,
        this.agent,
        this.xmtp,
      );
      if (!context) {
        logMessage("No context found" + message);
        return;
      }

      //Await response
      const awaitedHandler = awaitedHandlers.get(
        context.xmtp.getConversationKey(),
      );
      if (awaitedHandler) {
        const messageText =
          context.message.content.text || context.message.content.reply || "";
        // Check if the response is from the expected user
        const expectedUser = context.xmtp.getConversationKey().split(":")[1];
        const actualSender = message.sender.address;

        if (expectedUser?.toLowerCase() === actualSender?.toLowerCase()) {
          const isValidResponse = await awaitedHandler(messageText);
          // Only remove the handler if we got a valid response
          if (isValidResponse) {
            awaitedHandlers.delete(context.xmtp.getConversationKey());
          }
        }
        return;
      }

      // Check if the message content triggers a skill
      const { isMessageValid, customHandler } = await filterMessage(context);
      if (isMessageValid && customHandler) {
        const result = await customHandler(context);
        if (result && "code" in result) {
          if (result.code === 200) {
            await context.dm(result.message);
          }
        }
      } else if (isMessageValid && this.agent?.onMessage)
        await this.agent?.onMessage?.(context);
      else if (isMessageValid && !this.agent?.onMessage)
        await this.onMessage(context);
    } catch (e) {
      console.log(`error`, e);
    }
  };

  onMessage = async (context: Context) => {
    /*Default onMessage function, replaces the prompt file*/
    const { agent } = context;
    if (!agent.systemPrompt) {
      console.log("System prompt is not defined");
      return;
    }
    await agentReply(context);
  };

  async awaitResponse(
    prompt: string,
    validResponses?: string[],
    attempts?: number,
  ): Promise<string> {
    await this.dm(`${prompt}`);
    let attemptCount = 0;
    attempts = attempts ?? 2;

    return new Promise<string>((resolve, reject) => {
      const handler = async (text: string) => {
        if (!text) return false;
        attemptCount++;

        const response = text.trim().toLowerCase();

        // If no validResponses provided, accept any non-empty response
        if (!validResponses) {
          this.resetAwaitedState();
          resolve(response);
          return true;
        }

        // Check if response is valid
        if (validResponses.map((r) => r.toLowerCase()).includes(response)) {
          this.resetAwaitedState();
          resolve(response);
          return true;
        }

        // Check if max attempts reached
        if (attemptCount >= attempts) {
          this.resetAwaitedState();
          reject(
            new Error(
              `Max attempts (${attempts}) reached without valid response`,
            ),
          );
          return true;
        }

        // Invalid response - send error message and continue waiting
        await this.dm(
          `Invalid response "${text}". Please respond with one of: ${validResponses.join(", ")}. Attempts remaining: ${attempts - attemptCount}`,
        );
        return false;
      };

      // Add the handler to the Map
      awaitedHandlers.set(this.xmtp.getConversationKey(), handler);
    });
  }
  // Method to reset the awaited state
  resetAwaitedState() {
    this.awaitingResponse = false;
    this.awaitedHandler = undefined;
    awaitedHandlers.delete(this.xmtp.getConversationKey());
  }
  async sendAgentMessage(message: string, metadata: any) {
    this.addMemory(message);
    this.xmtp.sendAgentMessage(message, metadata);
  }
  async reply(message: string) {
    this.addMemory(message);
    await this.xmtp.reply(message, this.message.id);
  }
  addMemory(message: string) {
    logMessage("sent:" + message);
    chatMemory.addEntry(this.getMemoryKey(), message, "assistant");
  }

  getMemoryKey() {
    return this.xmtp.getConversationKey() + ":" + this.message?.sender?.address;
  }

  async react(emoji: string) {
    this.addMemory(emoji);
    this.xmtp.react(emoji, this.message.id);
  }

  async sendTo(message: string, receivers: string[]) {
    if (typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    for (const receiver of receivers) {
      if (this.xmtp.address.toLowerCase() === receiver.toLowerCase()) {
        continue;
      }
      this.dm(message, receiver);
    }
  }
  async dm(message: string, receiver?: string) {
    this.addMemory(message);
    this.xmtp.sendMessage(message, receiver);
  }
  async send(message: string) {
    this.addMemory(message);
    this.xmtp.sendMessage(message);
  }
  async sendImage(image: string) {
    this.addMemory(image);
    this.xmtp.sendImage(image);
  }
}
