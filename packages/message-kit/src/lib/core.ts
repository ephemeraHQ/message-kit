import {
  Conversation,
  DecodedMessage,
  Client as V3Client,
} from "@xmtp/node-sdk";
import {
  DecodedMessage as DecodedMessageV2,
  Client as V2Client,
  Conversation as V2Conversation,
} from "@xmtp/xmtp-js";
import { GroupMember } from "@xmtp/node-sdk";
import { ContentTypeId } from "@xmtp/content-type-primitives";
import { ContentTypeText } from "@xmtp/content-type-text";
import { ContentTypeReply, type Reply } from "@xmtp/content-type-reply";
import {
  ContentTypeReaction,
  type Reaction,
} from "@xmtp/content-type-reaction";
import {
  ContentTypeAttachment,
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
  type RemoteAttachment,
  type Attachment,
} from "@xmtp/content-type-remote-attachment";

import { agentReply, chatMemory, defaultSystemPrompt } from "../plugins/gpt.js";
import { getUserInfo, userInfoCache } from "../plugins/resolver.js";
import { logInitMessage, logMessage, readFile } from "../helpers/utils.js";
import {
  Message,
  Group,
  AgentMessage,
  ContentTypeAgentMessage,
  User,
} from "xmtp-agent";

import { Agent, SkillResponse } from "../helpers/types.js";

import {
  type ReadReceipt,
  ContentTypeReadReceipt,
} from "@xmtp/content-type-read-receipt";
import { WalletService as CdpWalletService } from "../plugins/cdp.js";
import { WalletService as CircleWalletService } from "../plugins/circle.js";
import {
  executeSkill,
  parseSkill,
  findSkill,
  filterMessage,
} from "./skills.js";
import { logUserInteraction } from "../helpers/utils.js";
import path from "path";
import fetch from "cross-fetch";
import type { AgentConfig } from "../helpers/types";
import { XMTP, createClient } from "xmtp-agent";
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
  group: Group;
  storage: LocalStorage;
  conversation: V2Conversation;
  client: V3Client;
  v2client: V2Client;
  agentConfig?: AgentConfig;
  walletService: CdpWalletService | CircleWalletService;
  sender?: User;
  awaitingResponse: boolean;
  sendAgentMessage: (message: string, metadata: any) => Promise<void>;
  executeSkill: (text: string) => Promise<SkillResponse | undefined>;
  clearMemory: (address?: string) => Promise<void>;
  clearCache: (address?: string) => Promise<void>;
  // Add method signatures for all public methods
  awaitResponse(
    prompt: string,
    validResponses?: string[],
    attempts?: number,
  ): Promise<string>;
  resetAwaitedState(): void;
  getMemoryKey(): string;
  sendTo(message: string, receivers: string[]): Promise<void>;
  reply(message: string): Promise<void>;
  dm(message: string): Promise<void>;
  send(
    message: string | Reply | Reaction | RemoteAttachment | Attachment,
    contentType?: ContentTypeId,
    targetConversation?: V2Conversation,
  ): Promise<void>;
  awaitedHandler: ((text: string) => Promise<boolean | void>) | undefined;
  xmtp: XMTP;
  agent: Agent;
};

/* Context implementation */
export class MessageKit implements Context {
  xmtp!: XMTP;
  storage!: LocalStorage;
  originalMessage: DecodedMessage | DecodedMessageV2 | undefined = undefined;
  message!: Message; // A message from XMTP abstracted for agent use;
  group!: Group;
  conversation!: V2Conversation;
  client!: V3Client;
  v2client!: V2Client;
  agentConfig?: AgentConfig;
  walletService!: CdpWalletService | CircleWalletService;
  sender?: User;
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
    const { client, v2client } = await createClient(
      this.handleMessage,
      this.agent.config?.client,
    );
    this.client = client;
    this.v2client = v2client;

    // Store the GPT model in process.env for global access
    process.env.GPT_MODEL = this.agent.config?.gptModel || "gpt-4o";
    logInitMessage(client, this.agent);
  }
  static async create(
    conversation: Conversation | V2Conversation,
    message: DecodedMessage | DecodedMessageV2 | undefined,
    { client, v2client }: { client: V3Client; v2client: V2Client },
    agent: Agent,
  ): Promise<Context | undefined> {
    try {
      const context = new MessageKit(agent);
      const xmtp = new XMTP(client, v2client, conversation, message);
      context.xmtp = xmtp;

      context.client = client;
      context.v2client = v2client;
      if (conversation instanceof Conversation) {
        context.group = {
          id: conversation.id,
          sync: conversation.sync.bind(conversation),
          addMembers: conversation.addMembers.bind(conversation),
          send: conversation.send.bind(conversation),
          members: [],
          createdAt: conversation.createdAt,
          addMembersByInboxId:
            conversation.addMembersByInboxId.bind(conversation),
          isAdmin: () => false,
          isSuperAdmin: () => false,
          admins: conversation.admins,
          superAdmins: conversation.superAdmins,
        };
      } else {
        context.conversation = conversation;
      }

      if (message && message.id) {
        //v2
        const sentAt = "sentAt" in message ? message.sentAt : message.sent;
        let sender: User | undefined = undefined;
        if (v2client) {
          sender = {
            address: (message as DecodedMessageV2).senderAddress,
            inboxId: (message as DecodedMessageV2).senderAddress,
            installationIds: [],
            accountAddresses: [(message as DecodedMessageV2).senderAddress],
          } as User;
        } else {
          let group = await (conversation as Conversation);
          await group.sync();
          const members = await group.members();
          context.group.members = members.map((member: GroupMember) => ({
            inboxId: member.inboxId,
            address: member.accountAddresses[0],
            accountAddresses: member.accountAddresses,
            installationIds: member.installationIds,
          })) as User[];

          let MemberSender = members?.find(
            (member: GroupMember) =>
              member.inboxId === (message as DecodedMessage).senderInboxId,
          );

          sender = {
            address: MemberSender?.accountAddresses[0],
            inboxId: MemberSender?.inboxId,
            installationIds: [],
            accountAddresses: MemberSender?.accountAddresses,
          } as User;
        }
        let userInfo = await getUserInfo(sender?.address);
        sender.username = userInfo?.converseUsername;
        sender.ensDomain = userInfo?.ensDomain;

        //Config
        context.agent = agent;
        context.agent.systemPrompt = agent.systemPrompt ?? defaultSystemPrompt;
        context.agentConfig = agent.config;

        context.clearMemory = async () => {
          await chatMemory.clear(sender?.address);
        };
        context.clearCache = async () => {
          await userInfoCache.clear(sender?.address);
        };
        context.executeSkill = async (text: string) => {
          const result = await executeSkill(
            text,
            context.agent,
            context as unknown as Context,
          );
          return result ?? undefined;
        };
        let typeId = message.contentType?.typeId;

        //trim spaces from text
        let content =
          typeof message.content === "string"
            ? { content: message.content.trim(), ...message.contentType }
            : message.content;
        if (message?.contentType?.sameAs(ContentTypeText)) {
          const skillAction = findSkill(
            content?.content,
            context?.agent?.skills ?? [],
          );
          const extractedValues = skillAction
            ? await parseSkill(content?.content, skillAction)
            : undefined;
          if (extractedValues?.skill) {
            content = {
              text: content.content,
              ...extractedValues,
            };
            typeId = "skill";
          } else {
            content = {
              text: content.content,
            };
          }
        } else if (message?.contentType?.sameAs(ContentTypeReply)) {
          let previousMsg = await context.xmtp.getLastMessageById(
            content.reference,
          );
          content = {
            previousMsg: previousMsg,
            reply: content.content,
            text: content.content,
            reference: content.reference,
          };
        } else if (message?.contentType?.sameAs(ContentTypeReaction)) {
          content = {
            reaction: content.content,
            reference: content.reference,
          };
        } else if (message?.contentType?.sameAs(ContentTypeRemoteAttachment)) {
          const attachment = await RemoteAttachmentCodec.load(content, client);
          content = {
            attachment: attachment,
          };
        } else if (message?.contentType?.sameAs(ContentTypeReadReceipt)) {
          //Log read receipt
        } else if (message?.contentType?.sameAs(ContentTypeAgentMessage)) {
          content = {
            text: message.content.text,
            metadata: message.content.metadata,
          };
        } else if (message?.contentType?.sameAs(ContentTypeAttachment)) {
          const blobdecoded = new Blob([message.content.data], {
            type: message.content.mimeType,
          });
          const url = URL.createObjectURL(blobdecoded);

          content = {
            attachment: url,
          };
        }
        // Add interaction tracking
        logUserInteraction(sender?.address);
        context.message = {
          id: message.id,
          content,
          sender: sender,
          sent: sentAt,
          typeId: typeId ?? "",
        };

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
  handleMessage = async (
    message: DecodedMessage | DecodedMessageV2 | undefined,
  ) => {
    const conversation = await this.getConversation(message);
    if (message && conversation) {
      try {
        const { senderInboxId, kind } = message as DecodedMessage;
        const senderAddress = (message as DecodedMessageV2).senderAddress;
        if (
          //If same address do nothin
          senderAddress?.toLowerCase() ===
            this.v2client.address.toLowerCase() ||
          //If same address do nothin
          // Filter out membership_change messages
          (senderInboxId?.toLowerCase() === this.client.inboxId.toLowerCase() &&
            kind !== "membership_change")
        ) {
          return;
        }
        const context = await MessageKit.create(
          conversation,
          message,
          { client: this.client, v2client: this.v2client },
          this.agent,
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
          const actualSender = this.xmtp.isV2Message(message)
            ? (message as DecodedMessageV2).senderAddress
            : (message as DecodedMessage).senderInboxId;

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
        const { isMessageValid, customHandler } = await filterMessage(
          context,
          this.xmtp.isV2Message(message),
        );
        if (isMessageValid && customHandler) {
          const result = await customHandler(context);
          if (result && "code" in result) {
            if (result.code === 200) {
              await context.send(result.message);
            }
          }
        } else if (isMessageValid && this.agent?.onMessage)
          await this.agent?.onMessage?.(context);
        else if (isMessageValid && !this.agent?.onMessage)
          await this.onMessage(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  };
  getConversation = async (
    message: DecodedMessage | DecodedMessageV2 | undefined,
  ): Promise<Conversation | V2Conversation> => {
    return this.xmtp.isV2Message(message)
      ? ((await this.client.conversations.getConversationById(
          (message as DecodedMessage)?.conversationId as string,
        )) as Conversation)
      : ((message as DecodedMessageV2)?.conversation as V2Conversation);
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
    await this.send(`${prompt}`);
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
        await this.send(
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
  async reply(message: string) {
    if (typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    const reply = {
      content: message,
      contentType: ContentTypeText,
      reference: this.message.id,
    };
    this.send(reply, ContentTypeReply);
  }
  async sendAgentMessage(message: string, metadata: any) {
    const agentMessage = new AgentMessage(message, metadata);
    this.send(agentMessage, ContentTypeAgentMessage);
  }
  async send(
    message:
      | string
      | Reply
      | Reaction
      | RemoteAttachment
      | Attachment
      | ReadReceipt
      | AgentMessage,
    contentType: ContentTypeId = ContentTypeText,
    targetConversation?: V2Conversation,
  ) {
    await this.xmtp.send(
      message,
      contentType,
      targetConversation ?? this.conversation ?? this.group,
    );
    if (contentType === ContentTypeText && typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    let messageString = message as string;
    chatMemory.addEntry(this.getMemoryKey(), messageString, "assistant");
    logMessage("sent:" + messageString);
  }
  getMemoryKey() {
    return this.xmtp.getConversationKey() + ":" + this.message?.sender?.address;
  }

  async react(emoji: string) {
    const reaction: Reaction = {
      action: "added",
      schema: "unicode",
      reference: this.message.id,
      content: emoji,
    };
    this.send(reaction, ContentTypeReaction);
  }

  async sendTo(message: string, receivers: string[]) {
    if (typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    for (const receiver of receivers) {
      if (this.v2client.address.toLowerCase() === receiver.toLowerCase()) {
        continue;
      }

      let targetConversation =
        await this.xmtp.getV2ConversationBySender(receiver);

      if (!targetConversation) {
        targetConversation =
          await this.v2client.conversations.newConversation(receiver);
      }
      this.send(message, ContentTypeText, targetConversation as V2Conversation);
    }
  }
  async dm(message: string) {
    if (typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    let sender = this.message?.sender?.address;

    const targetConversation =
      await this.xmtp.getV2ConversationBySender(sender);
    this.send(message, ContentTypeText, targetConversation as V2Conversation);
  }

  async sendImage(source: string) {
    try {
      let imgArray: Uint8Array;
      let mimeType: string;
      let filename: string;

      const MAX_SIZE = 1024 * 1024; // 1MB in bytes

      // Check if source is a URL
      if (source.startsWith("http://") || source.startsWith("https://")) {
        try {
          // Handle URL
          const response = await fetch(source);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Check Content-Length header first if available
          const contentLength = response.headers.get("content-length");
          if (contentLength && parseInt(contentLength) > MAX_SIZE) {
            throw new Error("Image size exceeds 1MB limit");
          }

          const arrayBuffer = await response.arrayBuffer();

          // Double check actual size
          if (arrayBuffer.byteLength > MAX_SIZE) {
            throw new Error("Image size exceeds 1MB limit");
          }

          imgArray = new Uint8Array(arrayBuffer);
          mimeType = response.headers.get("content-type") || "image/jpeg";
          filename = source.split("/").pop() || "image";

          // If filename doesn't have an extension, add one based on mime type
          if (!filename.includes(".")) {
            const ext = mimeType.split("/")[1];
            filename = `${filename}.${ext}`;
          }
        } catch (error) {
          console.error("Error fetching image from URL:", error);
          throw error;
        }
      } else {
        // Handle file path
        const file = await readFile(source);
        if (!file) {
          console.error("File operations not supported in this environment");
          return;
        }

        // Check file size
        if (file.length > MAX_SIZE) {
          throw new Error("Image size exceeds 1MB limit");
        }

        filename = path.basename(source);
        const extname = path.extname(source);
        mimeType = `image/${extname.replace(".", "").replace("jpg", "jpeg")}`;
        imgArray = new Uint8Array(file);
      }

      const attachment = {
        filename,
        mimeType,
        data: imgArray,
      };

      await this.send(attachment, ContentTypeAttachment);
    } catch (error) {
      console.error("Failed to send image:", error);
      throw error;
    }
  }
}
