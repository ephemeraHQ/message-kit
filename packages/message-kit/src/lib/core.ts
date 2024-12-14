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
import { chatMemory, defaultSystemPrompt } from "../plugins/gpt.js";
import { GroupMember } from "@xmtp/node-sdk";
import {
  getUserInfo,
  userInfoCache,
  isOnXMTP,
  type UserInfo,
} from "../plugins/resolver.js";
import type { ContentTypeId } from "@xmtp/content-type-primitives";
import { ContentTypeText } from "@xmtp/content-type-text";
import { WalletService } from "../plugins/cdp.js";
import { logMessage, readFile } from "../helpers/utils.js";
import {
  AgentConfig,
  MessageAbstracted,
  GroupAbstracted,
  Agent,
  SkillResponse,
  AbstractedMember,
} from "../helpers/types.js";
import { FrameKit } from "../plugins/framekit.js";
import { ContentTypeReply, type Reply } from "@xmtp/content-type-reply";
import { executeSkill, parseSkill, findSkill } from "./skills.js";
import {
  ContentTypeAttachment,
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
  type RemoteAttachment,
  type Attachment,
} from "@xmtp/content-type-remote-attachment";
import { logUserInteraction } from "../helpers/utils.js";
import {
  ContentTypeReaction,
  type Reaction,
} from "@xmtp/content-type-reaction";
import path from "path";
import fetch from "cross-fetch";

export const awaitedHandlers = new Map<
  string,
  (text: string) => Promise<boolean | undefined>
>();

/* Context Interface */
export type Context = {
  refConv: Conversation | V2Conversation | undefined;
  message: MessageAbstracted;
  group: GroupAbstracted;
  conversation: V2Conversation;
  client: V3Client;
  version: "v2" | "v3";
  v2client: V2Client;
  agentConfig?: AgentConfig;
  agent: Agent;
  walletService: WalletService;
  framekit: FrameKit;
  sender?: AbstractedMember;
  awaitingResponse: boolean;
  getMessageById: (id: string) => DecodedMessage | null;
  executeSkill: (text: string) => Promise<SkillResponse | undefined>;
  clearMemory: (address?: string) => Promise<void>;
  clearCache: (address?: string) => Promise<void>;

  // Add method signatures for all public methods
  awaitResponse(
    prompt: string,
    validResponses?: string[],
    attempts?: number,
  ): Promise<string>;
  isOnXMTP(address: string): Promise<{ v2: boolean; v3: boolean }>;
  getUserInfo(address: string): Promise<UserInfo | undefined>;
  resetAwaitedState(): void;
  getV2ConversationBySender(
    sender: string,
  ): Promise<V2Conversation | undefined>;
  getV2MessageById(
    conversationId: string,
    reference: string,
  ): Promise<DecodedMessageV2 | undefined>;
  getMemoryKey(): string;
  sendTo(message: string, receivers: string[]): Promise<void>;
  getLastMessageById(reference: string): Promise<any>;
  reply(message: string): Promise<void>;
  dm(message: string): Promise<void>;
  send(
    message: string | Reply | Reaction | RemoteAttachment | Attachment,
    contentType?: ContentTypeId,
    targetConversation?: V2Conversation,
  ): Promise<void>;
  getConversationKey(): string;
  awaitedHandler: ((text: string) => Promise<boolean | void>) | undefined;
};

/* Context implementation */
export class MessageKit implements Context {
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
  walletService!: WalletService;
  sender?: AbstractedMember;
  awaitingResponse: boolean = false;
  getMessageById: (id: string) => DecodedMessage | null = () => null;
  executeSkill: (text: string) => Promise<SkillResponse | undefined> =
    async () => undefined;
  clearMemory: (address?: string) => Promise<void> = async () => {};
  clearCache: (address?: string) => Promise<void> = async () => {};
  awaitedHandler: ((text: string) => Promise<boolean | void>) | undefined =
    undefined;

  private constructor(
    conversation: Conversation | V2Conversation,
    { client, v2client }: { client: V3Client; v2client: V2Client },
  ) {
    this.client = client;
    this.v2client = v2client;
    this.framekit = new FrameKit(this as unknown as Context);
    if (conversation instanceof Conversation) {
      this.group = {
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
      this.version = "v3";
    } else {
      this.version = "v2";
      this.conversation = conversation;
    }
  }
  static async create(
    conversation: Conversation | V2Conversation,
    message: DecodedMessage | DecodedMessageV2 | undefined,
    { client, v2client }: { client: V3Client; v2client: V2Client },
    agent: Agent,
    version?: "v2" | "v3",
  ): Promise<Context | undefined> {
    try {
      const context = new MessageKit(conversation, { client, v2client });
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

        context.getMessageById =
          client.conversations?.getMessageById?.bind(client.conversations) ||
          (() => undefined);

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
            ? parseSkill(content?.content, skillAction)
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
          let previousMsg = await context.getLastMessageById(content.reference);
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
        if (
          process.env.COINBASE_API_KEY_NAME &&
          process.env.COINBASE_API_KEY_PRIVATE_KEY
        ) {
          context.walletService = new WalletService(
            context as unknown as Context,
          );
        }

        return context as unknown as Context;
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
        console.log(text);
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
      awaitedHandlers.set(this.getConversationKey(), handler);
    });
  }
  // Method to reset the awaited state
  resetAwaitedState() {
    this.awaitingResponse = false;
    this.awaitedHandler = undefined;
    awaitedHandlers.delete(this.getConversationKey());
  }
  async getV2ConversationBySender(sender: string) {
    try {
      if (this.isV2Conversation(this.conversation)) {
        return this.conversation;
      }
      return this.v2client.conversations
        .list()
        .then((conversations) =>
          conversations.find(
            (conv) => conv.peerAddress.toLowerCase() === sender.toLowerCase(),
          ),
        );
    } catch (error) {
      console.error("Error getting V2 conversation by sender:", error);
      return undefined;
    }
  }
  async getV2MessageById(
    conversationId: string,
    reference: string,
  ): Promise<DecodedMessageV2 | undefined> {
    /*Takes to long, deprecated*/
    try {
      const conversations = await this.v2client.conversations.list();
      const conversation = conversations.find(
        (conv) => conv.topic === conversationId,
      );
      if (!conversation) return undefined;
      const messages = await conversation.messages();
      return messages.find((m) => m.id === reference) as DecodedMessageV2;
    } catch (error) {
      console.error("Error getting V2 message by id:", error);
      return undefined;
    }
  }
  /*NEEDS TO BE FIXED
  async getV3ReplyChain(reference: string): Promise<{
    chain: Array<{ address: string; content: string }>;
    isSenderInChain: boolean;
  }> {
    try {
      let msg: DecodedMessage | DecodedMessageV2 | undefined = undefined;
      let senderAddress: string = "";
      msg = await this.getMessageById(reference);
      if (!msg) {
        return {
          chain: [],
          isSenderInChain: false,
        };
      }
      let group = await (this.refConv as Conversation);
      if (group) {
        let members: GroupMember[] = [];
        try {
          await group.sync();
          members = await group.members();
        } catch (error) {
          console.error(
            "Failed to sync group or fetch members in reply chain:",
            error,
          );
          members = [];
        }
        let sender = members?.find(
          (member: GroupMember) =>
            member.inboxId === (msg as DecodedMessage).senderInboxId ||
            member.accountAddresses.includes(
              (msg as unknown as DecodedMessageV2).senderAddress,
            ),
        );
        senderAddress = sender?.accountAddresses[0] ?? "";

        let content = msg?.content?.content ?? msg?.content;
        let isSenderBot =
          senderAddress.toLowerCase() === botAddress?.toLowerCase();
        let chain = [{ address: senderAddress, content: content }];
        if (msg?.content?.reference) {
          const { chain: replyChain, isSenderInChain } =
            await this.getV3ReplyChain(msg.content.reference, botAddress);
          chain = replyChain;
          isSenderBot = isSenderBot || isSenderInChain;

          chain.push({
            address: senderAddress,
            content: content,
          });
        }
        return {
          chain: chain,
          isSenderInChain: isSenderBot,
        };
      } else {
        return {
          chain: [],
          isSenderInChain: false,
        };
      }
    } catch (error) {
      console.error("Error getting reply chain:", error);
      return {
        chain: [],
        isSenderInChain: false,
      };
    }
  }*/
  async getLastMessageById(reference: string) {
    let msg = await (this.version === "v3"
      ? this.getMessageById(reference)
      : this.getV2MessageById(this.conversation.topic, reference));
    msg = msg?.content;
    return msg;
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

  async send(
    message: string | Reply | Reaction | RemoteAttachment | Attachment,
    contentType: ContentTypeId = ContentTypeText,
    targetConversation?: V2Conversation,
  ) {
    if (contentType === ContentTypeText && typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    let messageString = message as string;
    if (typeof message === "object") {
      //@ts-ignore
      messageString = message?.content as string;
    }
    const conversation =
      targetConversation ?? this.refConv ?? this.conversation ?? this.group;
    if (conversation) {
      if (this.isV2Conversation(conversation)) {
        await conversation.send(message, {
          contentType: contentType,
        });
      } else if (this.isV3Conversation(conversation)) {
        await conversation.send(message, contentType);
      }
      chatMemory.addEntry(this.getMemoryKey(), messageString, "assistant");
      console.log(messageString);
      logMessage("sent:" + messageString);
    }
  }
  getMemoryKey() {
    return this.getConversationKey() + ":" + this.message?.sender?.address;
  }
  getConversationKey() {
    const conversation = this.refConv || this.conversation || this.group;
    return `${(conversation as V2Conversation)?.topic || (conversation as Conversation)?.id}`;
  }
  getUserConversationKey() {
    const conversation = this.refConv || this.conversation || this.group;
    const awaitingSender =
      this.message?.sender?.inboxId || this.message?.sender?.address;
    return `${(conversation as V2Conversation)?.topic || (conversation as Conversation)?.id}:${awaitingSender}`;
  }
  isV2Conversation(
    conversation: Conversation | V2Conversation | undefined,
  ): conversation is V2Conversation {
    return (conversation as V2Conversation)?.topic !== undefined;
  }
  isV3Conversation(
    conversation: Conversation | V2Conversation | undefined,
  ): conversation is Conversation {
    return (conversation as Conversation)?.id !== undefined;
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

      let targetConversation = await this.getV2ConversationBySender(receiver);

      if (!targetConversation) {
        targetConversation =
          await this.v2client.conversations.newConversation(receiver);
      }
      this.send(message, ContentTypeText, targetConversation);
    }
  }
  async dm(message: string) {
    if (typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    let sender = this.message?.sender?.address;
    this.send(
      message,
      ContentTypeText,
      await this.getV2ConversationBySender(sender),
    );
  }

  async getUserInfo(username: string) {
    return await getUserInfo(username);
  }
  async isOnXMTP(address: string): Promise<{ v2: boolean; v3: boolean }> {
    return await isOnXMTP(this.client, this.v2client, address);
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