import { Conversation, DecodedMessage, Client } from "@xmtp/node-sdk";
import {
  DecodedMessage as DecodedMessageV2,
  Client as V2Client,
  Conversation as V2Conversation,
} from "@xmtp/xmtp-js";
import { GroupMember } from "@xmtp/node-sdk";
import fs from "fs/promises";
import type { Reaction } from "@xmtp/content-type-reaction";
import { ContentTypeText } from "@xmtp/content-type-text";
import { logMessage } from "../helpers/utils.js";
import {
  SkillGroup,
  MessageAbstracted,
  GroupAbstracted,
  SkillResponse,
  AbstractedMember,
} from "../helpers/types.js";
import { ContentTypeReply } from "@xmtp/content-type-reply";
import { executeSkill, loadSkillsFile, parseSkill } from "./skills.js";
import {
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import { ContentTypeReaction } from "@xmtp/content-type-reaction";

export const awaitedHandlers = new Map<
  string,
  (text: string) => Promise<boolean | undefined>
>();

export class HandlerContext {
  refConv: Conversation | V2Conversation | null = null;

  message!: MessageAbstracted;
  group!: GroupAbstracted;
  conversation!: V2Conversation;
  client!: Client;
  version!: "v2" | "v3";
  v2client!: V2Client;
  skills?: SkillGroup[];
  members?: AbstractedMember[];
  admins?: string[];
  superAdmins?: string[];
  sender?: AbstractedMember;
  awaitingResponse: boolean = false;
  awaitedHandler: ((text: string) => Promise<boolean | void>) | null = null;
  getMessageById!: (id: string) => DecodedMessage | null;
  executeSkill!: (text: string) => Promise<SkillResponse | undefined>;
  private constructor(
    conversation: Conversation | V2Conversation,
    { client, v2client }: { client: Client; v2client: V2Client },
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
    { client, v2client }: { client: Client; v2client: V2Client },
    skills?: SkillGroup[],
    version?: "v2" | "v3",
  ): Promise<HandlerContext | null> {
    const context = new HandlerContext(conversation, { client, v2client });
    if (message && message.id) {
      //v2
      const sentAt = "sentAt" in message ? message.sentAt : message.sent;
      let members: GroupMember[];
      if (version === "v2") {
        context.sender = {
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

        context.sender = {
          address: MemberSender?.accountAddresses[0],
          inboxId: MemberSender?.inboxId,
          installationIds: [],
          accountAddresses: MemberSender?.accountAddresses,
        } as AbstractedMember;
      }

      context.skills = skills ?? (await loadSkillsFile());

      context.getMessageById =
        client.conversations?.getMessageById?.bind(client.conversations) ||
        (() => null);
      // **Correct Binding:**
      context.executeSkill = async (text: string) => {
        const result = await executeSkill(text, context.skills ?? [], context);
        return result ?? undefined;
      };
      let typeId = message.contentType?.typeId;

      //trim spaces from text
      let content =
        typeof message.content === "string"
          ? { content: message.content.trim(), ...message.contentType }
          : message.content;

      if (message?.contentType?.sameAs(ContentTypeText)) {
        const extractedValues = parseSkill(content.content, context.skills);
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
        content = {
          reply: content.content,
          replyChain: await context.getReplyChain(
            content.reference,
            version ?? "v2",
          ),
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
      }
      context.message = {
        id: message.id,
        content,
        sender: context.sender,
        sent: sentAt,
        typeId: typeId ?? "",
        version: version ?? "v2",
      };
      return context;
    }
    return null;
  } // Add properties to track awaited responses

  async awaitResponse(
    prompt: string,
    validResponses: string[],
  ): Promise<string> {
    if (!validResponses || validResponses.length === 0) {
      throw new Error("Valid responses array must not be empty");
    }

    await this.send(`${prompt}`);

    return new Promise<string>((resolve, reject) => {
      // Create the handler function
      const handler = async (text: string) => {
        if (!text) return false;

        const response = text.trim().toLowerCase();

        if (validResponses.map((r) => r.toLowerCase()).includes(response)) {
          this.resetAwaitedState();
          resolve(response);
          return true;
        }

        await this.send(
          `Invalid response "${text}". Please respond with one of: ${validResponses.join(", ")}`,
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

  async getV2MessageById(reference: string): Promise<DecodedMessageV2 | null> {
    const conversations = await this.v2client.conversations.list();
    for (const conversation of conversations) {
      const messages = await conversation.messages();
      if (messages.find((m) => m.id === reference)) {
        return messages.find((m) => m.id === reference) as DecodedMessageV2;
      }
    }
    return null;
  }

  async getReplyChain(
    reference: string,
    version: "v2" | "v3",
    botAddress?: string,
  ): Promise<{
    chain: Array<{ address: string; content: string }>;
    isSenderInChain: boolean;
  }> {
    let msg: DecodedMessage | DecodedMessageV2 | null = null;
    let senderAddress: string = "";

    if (version === "v3") msg = await this.getMessageById(reference);
    else if (version === "v2") msg = await this.getV2MessageById(reference);
    let members: GroupMember[] = [];
    if (!msg) {
      return {
        chain: [],
        isSenderInChain: false,
      };
    }
    let group = await (this.refConv as Conversation);
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
          (msg as DecodedMessageV2).senderAddress,
        ),
    );
    senderAddress = sender?.accountAddresses[0] ?? "";

    let content = msg?.content?.content ?? msg?.content;
    let isSenderBot = senderAddress.toLowerCase() === botAddress?.toLowerCase();
    let chain = [{ address: senderAddress, content: content }];
    if (msg?.content?.reference) {
      const { chain: replyChain, isSenderInChain } = await this.getReplyChain(
        msg.content.reference,
        version,
        botAddress,
      );
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
    const conversation = this.refConv || this.conversation || this.group;

    if (conversation) {
      if (this.isV2Conversation(conversation)) {
        await conversation.send(reply, { contentType: ContentTypeReply });
        logMessage("sent: " + reply.content);
      } else {
        await conversation.send(reply, ContentTypeReply);
        logMessage("sent: " + reply.content);
      }
    }
  }

  async send(message: string) {
    if (typeof message !== "string") {
      console.error("Message must be a string");
      return;
    }
    const conversation = this.refConv || this.conversation || this.group;
    if (conversation) {
      await conversation.send(message);
      logMessage("sent: " + message);
    }
  }
  getConversationKey() {
    const conversation = this.refConv || this.conversation || this.group;
    return (
      (conversation as V2Conversation)?.topic ||
      (conversation as Conversation)?.id
    );
  }
  isV2Conversation(
    conversation: Conversation | V2Conversation | null,
  ): conversation is V2Conversation {
    return (conversation as V2Conversation)?.topic !== undefined;
  }

  async react(emoji: string) {
    const reaction: Reaction = {
      action: "added",
      schema: "unicode",
      reference: this.message.id,
      content: emoji,
    };
    const conversation = this.refConv || this.conversation || this.group;
    if (conversation) {
      if (this.isV2Conversation(conversation)) {
        await conversation.send(reaction, { contentType: ContentTypeReaction });
      } else if (conversation instanceof Conversation) {
        await conversation.send(reaction, ContentTypeReaction);
      }
    }
  }

  async getCacheCreationDate() {
    //Gets the creation date of the cache folder
    //Could be used to check if the cache is outdated
    //Generally indicates the deployment date of the bot
    try {
      const stats = await fs.stat(".data");
      const cacheCreationDate = new Date(stats.birthtime);
      return cacheCreationDate;
    } catch (err) {
      console.error(err);
    }
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
}
