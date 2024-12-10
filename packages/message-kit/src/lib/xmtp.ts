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
import { chatMemory } from "../helpers/gpt.js";
import { GroupMember } from "@xmtp/node-sdk";
import { textGeneration } from "../helpers/gpt.js";
import { getUserInfo, isOnXMTP } from "../helpers/resolver.js";
import type { ContentTypeId } from "@xmtp/content-type-primitives";
import { ContentTypeText } from "@xmtp/content-type-text";
import { WalletService } from "../helpers/cdp.js";
import { logMessage, extractFrameChain } from "../helpers/utils.js";
import {
  RunConfig,
  MessageAbstracted,
  GroupAbstracted,
  Agent,
  SkillResponse,
  AbstractedMember,
  Frame,
} from "../helpers/types.js";
import { ContentTypeReply, type Reply } from "@xmtp/content-type-reply";
import {
  executeSkill,
  parseSkill,
  findSkill,
  loadSkillsFile,
} from "./skills.js";
import {
  ContentTypeAttachment,
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
  type RemoteAttachment,
  type Attachment,
} from "@xmtp/content-type-remote-attachment";
import { getFS } from "../helpers/utils";
import {
  ContentTypeReaction,
  type Reaction,
} from "@xmtp/content-type-reaction";
import path from "path";
import fetch from "cross-fetch";

const fileHandling = {
  async getCacheCreationDate() {
    const { fsPromises } = getFS();
    if (!fsPromises) return null;
    try {
      const stats = await fsPromises.stat(".data");
      return new Date(stats.birthtime);
    } catch (err) {
      console.error("Error getting cache creation date:", err);
      return null;
    }
  },
  // hey

  async readFile(filePath: string) {
    const { fs } = getFS();
    if (!fs) return null;
    try {
      return await fs.readFileSync(filePath);
    } catch (err) {
      console.error("Error reading file:", err);
      return null;
    }
  },
};

//com
const framesUrl = process.env.frames_URL ?? "https://frames.message-kit.org/";
export const awaitedHandlers = new Map<
  string,
  (text: string) => Promise<boolean | undefined>
>();

export class XMTPContext {
  refConv: Conversation | V2Conversation | null = null;
  message!: MessageAbstracted;
  group!: GroupAbstracted;
  conversation!: V2Conversation;
  client!: V3Client;
  version!: "v2" | "v3";
  v2client!: V2Client;
  members?: AbstractedMember[];
  admins?: string[];
  runConfig?: RunConfig;
  superAdmins?: string[];
  agent: Agent = {
    name: "",
    description: "",
    tag: "",
    skills: [],
  };
  walletService!: WalletService;
  sender?: AbstractedMember;
  awaitingResponse: boolean = false;
  awaitedHandler: ((text: string) => Promise<boolean | void>) | null = null;
  getMessageById!: (id: string) => DecodedMessage | null;
  executeSkill!: (text: string) => Promise<SkillResponse | undefined>;
  private constructor(
    conversation: Conversation | V2Conversation,
    { client, v2client }: { client: V3Client; v2client: V2Client },
  ) {
    this.client = client;
    this.v2client = v2client;
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
    message: DecodedMessage | DecodedMessageV2 | null,
    { client, v2client }: { client: V3Client; v2client: V2Client },
    runConfig: RunConfig,
    version?: "v2" | "v3",
  ): Promise<XMTPContext | null> {
    try {
      const context = new XMTPContext(conversation, { client, v2client });
      if (message && message.id) {
        //v2
        const sentAt = "sentAt" in message ? message.sentAt : message.sent;
        let members: GroupMember[];
        let sender: AbstractedMember | null = null;
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
        context.agent = runConfig?.agent ?? (await loadSkillsFile());

        context.getMessageById =
          client.conversations?.getMessageById?.bind(client.conversations) ||
          (() => null);

        context.executeSkill = async (text: string) => {
          const result = await executeSkill(text, context.agent, context);
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
            context?.agent?.skills.flat(),
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
            attachment: { url: url },
          };
        }
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
          context.walletService = new WalletService(context);
        }

        return context;
      }
      return null;
    } catch (error) {
      console.error("Error creating XMTPContext:", error);
      return null;
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
          try {
            chatMemory.addEntry(this.sender?.address ?? "", {
              role: "user",
              content: text,
            });
          } catch (error) {
            console.error("Error adding entry to chatMemory:", error);
          }
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
    this.awaitedHandler = null;
    awaitedHandlers.delete(this.getConversationKey());
  }

  async getV2MessageById(
    conversationId: string,
    reference: string,
  ): Promise<DecodedMessageV2 | null> {
    /*Takes to long, deprecated*/
    const conversations = await this.v2client.conversations.list();
    const conversation = conversations.find(
      (conv) => conv.topic === conversationId,
    );
    if (!conversation) return null;
    const messages = await conversation.messages();
    return messages.find((m) => m.id === reference) as DecodedMessageV2;
  }
  /*NEEDS TO BE FIXED
  async getV3ReplyChain(reference: string): Promise<{
    chain: Array<{ address: string; content: string }>;
    isSenderInChain: boolean;
  }> {
    try {
      let msg: DecodedMessage | DecodedMessageV2 | null = null;
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
  ) {
    if (contentType === ContentTypeText && typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    const conversation = this.refConv || this.conversation || this.group;
    if (conversation) {
      if (this.isV2Conversation(conversation)) {
        await conversation.send(message, {
          contentType: contentType,
        });
      } else if (this.isV3Conversation(conversation)) {
        await conversation.send(message, contentType);
      }
    }
  }
  getConversationKey() {
    const conversation = this.refConv || this.conversation || this.group;
    const awaitingSender =
      this.message?.sender?.inboxId || this.message?.sender?.address;
    return `${(conversation as V2Conversation)?.topic || (conversation as Conversation)?.id}:${awaitingSender}`;
  }
  isV2Conversation(
    conversation: Conversation | V2Conversation | null,
  ): conversation is V2Conversation {
    return (conversation as V2Conversation)?.topic !== undefined;
  }
  isV3Conversation(
    conversation: Conversation | V2Conversation | null,
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

  async getCacheCreationDate() {
    return await fileHandling.getCacheCreationDate();
  }
  async sendTo(message: string, receivers: string[]) {
    if (typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    const conversations = await this.v2client.conversations.list();
    for (const receiver of receivers) {
      if (this.v2client.address.toLowerCase() === receiver.toLowerCase()) {
        continue;
      }

      let targetConversation = conversations.find(
        (conv) => conv.peerAddress.toLowerCase() === receiver.toLowerCase(),
      );

      if (!targetConversation) {
        targetConversation =
          await this.v2client.conversations.newConversation(receiver);
      }

      // Send the message only once per receiver
      await targetConversation.send(message);
      logMessage("sent: " + message);
    }
  }

  async sendCustomFrame(frame: Frame) {
    // Convert the frame object to URL-encoded parameters
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(frame)) {
      params.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : value,
      );
    }

    const frameUrl = `${framesUrl}/custom?${params.toString()}`;
    await this.send(frameUrl);
  }
  async getUserInfo(username: string) {
    return await getUserInfo(username);
  }
  async isOnXMTP(v3client: V3Client, v2client: V2Client, address: string) {
    return await isOnXMTP(v3client, v2client, address);
  }
  async textGeneration(
    memoryKey: string,
    userPrompt: string,
    systemPrompt?: string,
  ) {
    return await textGeneration(memoryKey, userPrompt, systemPrompt);
  }
  async requestPayment(
    amount: number = 1,
    token: string = "usdc",
    username: string = "humanagent.eth",
    sendTo: string[] = [],
    onRampURL?: string,
  ) {
    let senderInfo = await getUserInfo(username);
    if (senderInfo && process.env.MSG_LOG === "true")
      if (!senderInfo) {
        //console.log("senderInfo", senderInfo);
        console.error("Failed to get sender info");
        return;
      }

    let sendUrl = `${framesUrl}/payment?amount=${amount}&token=${token}&recipientAddress=${senderInfo?.address}`;
    if (onRampURL) {
      sendUrl = sendUrl + "&onRampURL=" + encodeURIComponent(onRampURL);
    }
    if (sendTo.length > 0) {
      await this.sendTo(sendUrl, sendTo);
    } else {
      await this.send(sendUrl);
    }
  }
  async sendConverseDmFrame(peer: string, pretext?: string) {
    let url = `https://converse.xyz/dm/${peer}`;
    if (pretext) url += `&pretext=${encodeURIComponent(pretext)}`;
    await this.send(url);
  }

  async sendConverseGroupFrame(groupId: string, pretext?: string) {
    let url = `https://converse.xyz/group/${groupId}`;
    if (pretext) url += `&pretext=${encodeURIComponent(pretext)}`;
    await this.send(url);
  }

  async sendReceipt(txLink: string) {
    //const tkLink ="https://sepolia.basescan.org/tx/0xd60833f6e38ffce6e19109cf525726f54859593a0716201ae9f6444a04765a37";

    const { networkLogo, networkName, tokenName, dripAmount } =
      extractFrameChain(txLink);

    let receiptUrl = `${framesUrl}/receipt?txLink=${txLink}&networkLogo=${
      networkLogo
    }&networkName=${networkName}&tokenName=${tokenName}&amount=${dripAmount}`;

    await this.send(receiptUrl);
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
        const file = await fileHandling.readFile(source);
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
