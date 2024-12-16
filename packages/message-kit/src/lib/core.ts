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
import type { ContentTypeId } from "@xmtp/content-type-primitives";
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

import { chatMemory, defaultSystemPrompt } from "../plugins/gpt.js";
import { userInfoCache } from "../plugins/resolver.js";
import { logMessage, readFile } from "../helpers/utils.js";
import {
  MessageAbstracted,
  GroupAbstracted,
  Agent,
  SkillResponse,
  AbstractedMember,
} from "../helpers/types.js";
import {
  type ReadReceipt,
  ContentTypeReadReceipt,
} from "@xmtp/content-type-read-receipt";
import { WalletService as CdpWalletService } from "../plugins/cdp.js";
import { WalletService as CircleWalletService } from "../plugins/circle.js";
import { FrameKit } from "../plugins/framekit.js";
import { executeSkill, parseSkill, findSkill } from "./skills.js";
import { logUserInteraction } from "../helpers/utils.js";
import path from "path";
import fetch from "cross-fetch";
import type { AgentConfig } from "../helpers/types";
import { XmtpPlugin } from "../plugins/xmtp.js";
import { AgentMessage } from "../content-types/agent-message.js";
import { ContentTypeAgentMessage } from "../content-types/agent-message.js";
import { LocalStorage } from "../plugins/storage.js";

export const awaitedHandlers = new Map<
  string,
  (text: string) => Promise<boolean | undefined>
>();

/* Context Interface */
export type Context = {
  refConv: Conversation | V2Conversation | undefined;
  message: MessageAbstracted;
  group: GroupAbstracted;
  storage: LocalStorage;
  conversation: V2Conversation;
  client: V3Client;
  version: "v2" | "v3";
  v2client: V2Client;
  agentConfig?: AgentConfig;
  agent: Agent;
  walletService: CdpWalletService | CircleWalletService;
  framekit: FrameKit;
  sender?: AbstractedMember;
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
  xmtp: XmtpPlugin;
};

/* Context implementation */
export class MessageKit implements Context {
  xmtp!: XmtpPlugin;
  storage!: LocalStorage;
  framekit!: FrameKit; // Using ! since we know it will be initialized
  refConv: Conversation | V2Conversation | undefined = undefined;
  originalMessage: DecodedMessage | DecodedMessageV2 | undefined = undefined;
  message!: MessageAbstracted; // A message from XMTP abstracted for agent use;
  group!: GroupAbstracted;
  conversation!: V2Conversation;
  client!: V3Client;
  version!: "v2" | "v3";
  v2client!: V2Client;
  members?: AbstractedMember[];
  admins?: string[];
  agentConfig?: AgentConfig;
  superAdmins?: string[];
  agent: Agent = {
    name: "",
    description: "",
    tag: "",
  };
  walletService!: CdpWalletService | CircleWalletService;
  sender?: AbstractedMember;
  awaitingResponse: boolean = false;

  executeSkill: (text: string) => Promise<SkillResponse | undefined> =
    async () => undefined;
  clearMemory: (address?: string) => Promise<void> = async () => {};
  clearCache: (address?: string) => Promise<void> = async () => {};
  awaitedHandler: ((text: string) => Promise<boolean | void>) | undefined =
    undefined;

  private constructor() {
    // Empty constructor
  }

  static async create(
    conversation: Conversation | V2Conversation,
    message: DecodedMessage | DecodedMessageV2 | undefined,
    { client, v2client }: { client: V3Client; v2client: V2Client },
    agent: Agent,
    version?: "v2" | "v3",
  ): Promise<Context | undefined> {
    try {
      const context = new MessageKit();
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
        context.version = "v3";
      } else {
        context.version = "v2";
        context.conversation = conversation;
      }

      if (message && message.id) {
        //v2
        const sentAt = "sentAt" in message ? message.sentAt : message.sent;
        let members: GroupMember[];
        let sender: AbstractedMember | undefined = undefined;
        if (version === "v2") {
          sender = {
            address: (message as DecodedMessageV2).senderAddress,
            inboxId: (message as DecodedMessageV2).senderAddress,
            installationIds: [],
            accountAddresses: [(message as DecodedMessageV2).senderAddress],
          } as AbstractedMember;
        } else {
          let group = await (conversation as Conversation);
          await group.sync();
          members = await group.members();
          context.members = members.map((member: GroupMember) => ({
            inboxId: member.inboxId,
            address: member.accountAddresses[0],
            accountAddresses: member.accountAddresses,
            installationIds: member.installationIds,
          })) as AbstractedMember[];

          let MemberSender = members?.find(
            (member: GroupMember) =>
              member.inboxId === (message as DecodedMessage).senderInboxId,
          );

          sender = {
            address: MemberSender?.accountAddresses[0],
            inboxId: MemberSender?.inboxId,
            installationIds: [],
            accountAddresses: MemberSender?.accountAddresses,
          } as AbstractedMember;
        }

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
          version: version ?? "v2",
        };

        //Plugins
        context.framekit = new FrameKit(context as unknown as Context);
        context.xmtp = new XmtpPlugin(context as unknown as Context);
        context.storage = new LocalStorage();
        if (context.agentConfig?.walletService === true) {
          if (
            process.env.COINBASE_API_KEY_NAME &&
            process.env.COINBASE_API_KEY_PRIVATE_KEY
          ) {
            console.log("CDP Wallet Service Started");
            context.walletService = new CdpWalletService(
              context as unknown as Context,
            );
          } else if (process.env.CIRCLE_API_KEY) {
            console.log("Circle Wallet Service Started");
            context.walletService = new CircleWalletService(
              context as unknown as Context,
            );
          }
        }

        return context as Context;
      }
      return undefined;
    } catch (error) {
      console.error("Error creating Context:", error);
      return undefined;
    }
  }
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
    if (contentType === ContentTypeText && typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    let messageString = message as string;
    if (
      typeof message === "object" &&
      message !== undefined &&
      //@ts-ignore
      message?.content !== undefined
    ) {
      //@ts-ignore
      messageString = message?.content as string;
    }
    const conversation =
      targetConversation ?? this.refConv ?? this.conversation ?? this.group;
    if (conversation) {
      if (this.xmtp.isV2Conversation(conversation)) {
        await conversation.send(message, {
          contentType: contentType,
        });
      } else if (this.xmtp.isV3Conversation(conversation)) {
        await conversation.send(message, contentType);
      }
      chatMemory.addEntry(this.getMemoryKey(), messageString, "assistant");
      logMessage("sent:" + messageString);
    }
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
