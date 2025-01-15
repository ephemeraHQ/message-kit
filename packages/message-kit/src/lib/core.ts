import { Agent, SkillResponse } from "../helpers/types.js";
import { agentReply, chatMemory, defaultSystemPrompt } from "../plugins/gpt.js";
import { getUserInfo, userInfoCache } from "../plugins/resolver.js";
import { logInitMessage, logMessage } from "../helpers/utils.js";
import { Message, XMTP, Conversation, userMessage } from "xmtp";

import { WalletService as CdpWalletService } from "../plugins/cdp.js";
import { WalletService as CircleWalletService } from "../plugins/circle.js";
import {
  executeSkill,
  parseSkill,
  findSkill,
  filterMessage,
} from "../helpers/skills.js";
import { logUserInteraction } from "../helpers/utils.js";
import type { AgentConfig } from "../helpers/types";
import { LocalStorage } from "../plugins/storage.js";
import { astar } from "viem/chains";

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
  isDM: boolean;
  message: Message;
  storage: LocalStorage;
  agentConfig?: AgentConfig;
  walletService: CdpWalletService | CircleWalletService;
  awaitingResponse: boolean;
  agent: Agent;
  executeSkill: (text: string) => Promise<SkillResponse | undefined>;
  clearMemory: (address?: string) => Promise<void>;
  clearCache: (address?: string) => Promise<void>;
  send: (message: userMessage) => Promise<void>;
  awaitResponse(
    prompt: string,
    validResponses?: string[],
    attempts?: number,
  ): Promise<string>;
  resetAwaitedState(): void;

  //XMTP
  xmtp: XMTP;
  group: Conversation | undefined;
  getMemoryKey(sender: string, conversationId: string): string;
  awaitedHandler: ((text: string) => Promise<boolean | void>) | undefined;
};

/* Context implementation */
export class MessageKit implements Context {
  isDM: boolean = false;
  xmtp!: XMTP;
  storage!: LocalStorage;
  message!: Message;
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
    this.xmtp = new XMTP(this.handleMessage, this.agent.config?.client);
    await this.xmtp.init();
    // Store the GPT model in process.env for global access
    process.env.GPT_MODEL = this.agent.config?.gptModel || "gpt-4o";
    logInitMessage(this.xmtp?.client, this.agent);
  }
  static async create(
    message: Message,
    agent: Agent,
    xmtp: XMTP,
  ): Promise<Context | undefined> {
    try {
      const context = new MessageKit(agent);
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
        context.group = message.group;
        context.isDM = message.group?.members?.length === 2;
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
            context as Context,
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
              context.message.sender.address.toLowerCase(),
            );
          } else if (process.env.CIRCLE_API_KEY) {
            if (process.env.MSG_LOG === "true")
              console.log("Circle Wallet Service Started");
            context.walletService = new CircleWalletService(
              context.message.sender.address.toLowerCase(),
            );
          }
        }
        context.storage = new LocalStorage(".data/storage");

        return context;
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

      const context = await MessageKit.create(message, this.agent, this.xmtp);
      if (!context) {
        logMessage("No context found" + message);
        return;
      }

      //Await response
      const awaitedHandler = awaitedHandlers.get(
        context.xmtp.getConversationKey(message),
      );
      if (awaitedHandler) {
        const messageText =
          context.message.content.text || context.message.content.reply || "";
        // Check if the response is from the expected user
        const expectedUser = context.xmtp
          .getConversationKey(message)
          .split(":")[1];
        const actualSender = message.sender.address;

        if (expectedUser?.toLowerCase() === actualSender?.toLowerCase()) {
          const isValidResponse = await awaitedHandler(messageText);
          // Only remove the handler if we got a valid response
          if (isValidResponse) {
            awaitedHandlers.delete(context.xmtp.getConversationKey(message));
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
            await context.send({
              message: result.message,
              originalMessage: context.message,
            });
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
    await this.send({
      message: `${prompt}`,
      originalMessage: this.message,
    });
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
        await this.send({
          message: `Invalid response "${text}". Please respond with one of: ${validResponses.join(", ")}. Attempts remaining: ${attempts - attemptCount}`,
          originalMessage: this.message,
        });
        return false;
      };

      // Add the handler to the Map
      awaitedHandlers.set(
        this.getMemoryKey(
          this.message.sender.address,
          this.message.group?.id ?? "",
        ),
        handler,
      );
    });
  }
  // Method to reset the awaited state
  resetAwaitedState() {
    this.awaitingResponse = false;
    this.awaitedHandler = undefined;
    awaitedHandlers.delete(
      this.getMemoryKey(
        this.message.sender.address,
        this.message.group?.id ?? "",
      ),
    );
  }

  async send(message: userMessage): Promise<void> {
    this.addMemory(
      message.message,
      message.originalMessage?.sender.address,
      message.originalMessage?.group?.id as string,
    );
    await this.xmtp.send(message);
    return Promise.resolve();
  }
  addMemory(message: string, sender: string, conversationId: string) {
    chatMemory.addEntry(
      this.getMemoryKey(sender, conversationId),
      message,
      "assistant",
    );
  }

  getMemoryKey(sender: string, conversationId: string) {
    return conversationId + ":" + sender;
  }
}
