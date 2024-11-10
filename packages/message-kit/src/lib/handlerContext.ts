import { Conversation, DecodedMessage, Client } from "@xmtp/node-sdk";
import {
  DecodedMessage as DecodedMessageV2,
  Client as ClientV2,
  Conversation as ConversationV2,
} from "@xmtp/xmtp-js";
import { GroupMember } from "@xmtp/node-sdk";
import fs from "fs/promises";
import {} from "../helpers/utils";
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

export class HandlerContext {
  refConv: Conversation | ConversationV2 | null = null;

  message!: MessageAbstracted;
  group!: GroupAbstracted;
  conversation!: ConversationV2;
  client!: Client;
  version!: "v2" | "v3";
  v2client!: ClientV2;
  skills?: SkillGroup[];
  members?: AbstractedMember[];
  admins?: string[];
  superAdmins?: string[];
  sender?: AbstractedMember;
  getMessageById!: (id: string) => DecodedMessage | null;
  executeSkill!: (text: string) => Promise<SkillResponse | undefined>;
  private constructor(
    conversation: Conversation | ConversationV2,
    { client, v2client }: { client: Client; v2client: ClientV2 },
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
    conversation: Conversation | ConversationV2,
    message: DecodedMessage | DecodedMessageV2 | null,
    { client, v2client }: { client: Client; v2client: ClientV2 },
    skillsConfigPath?: string,
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
      //commands
      context.skills = await loadSkillsFile(skillsConfigPath);

      context.getMessageById =
        client.conversations?.getMessageById?.bind(client.conversations) ||
        (() => null);
      // **Correct Binding:**
      context.executeSkill = async (text: string) => {
        const result = await executeSkill(text, context.skills ?? [], context);
        return result ?? undefined;
      };
      //trim spaces from text
      let content =
        typeof message.content === "string"
          ? { content: message.content.trim(), ...message.contentType }
          : message.content;

      if (message?.contentType?.sameAs(ContentTypeText)) {
        const extractedValues = parseSkill(content.content, context.skills);
        if (extractedValues) {
          content = {
            ...content,
            text: content.content,
            ...extractedValues,
            typeId: message.contentType.typeId,
          };
        }
      } else if (message?.contentType?.sameAs(ContentTypeReply)) {
        content = {
          ...content,
          reply: content.content,
          replyChain: await context.getReplyChain(
            content.reference,
            version ?? "v2",
          ),
          reference: content.reference,
          typeId: message.content.contentType.typeId,
        };
      } else if (message?.contentType?.sameAs(ContentTypeReaction)) {
        content = {
          ...content,
          reaction: content.content,
          reference: content.reference,
          typeId: message.content.contentType.typeId,
        };
      } else if (message?.contentType?.sameAs(ContentTypeRemoteAttachment)) {
        const attachment = await RemoteAttachmentCodec.load(content, client);
        content = {
          ...content,
          ...message.contentType,
          attachment: attachment,
        };
      }
      context.message = {
        id: message.id,
        content: { ...content },
        sender: context.sender,
        typeId: message.contentType?.typeId as string,
        sent: sentAt,
        version: version ?? "v2",
      };
      return context;
    }
    return null;
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
      console.error('Failed to sync group or fetch members in reply chain:', error);
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
    const reply = {
      content: message,
      contentType: ContentTypeText,
      reference: this.message.id,
    };
    const conversation = this.refConv || this.conversation || this.group;

    if (conversation) {
      if (this.isConversationV2(conversation)) {
        await conversation.send(reply, { contentType: ContentTypeReply });
        logMessage("sent: " + reply.content);
      } else {
        await conversation.send(reply, ContentTypeReply);
        logMessage("sent: " + reply.content);
      }
    }
  }

  async send(message: string) {
    const conversation = this.refConv || this.conversation || this.group;
    if (conversation) {
      await conversation.send(message);
      logMessage("sent: " + message);
    }
  }

  isConversationV2(
    conversation: Conversation | ConversationV2 | null,
  ): conversation is ConversationV2 {
    return (conversation as ConversationV2)?.topic !== undefined;
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
      if (this.isConversationV2(conversation)) {
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
    const conversations = await this.v2client.conversations.list();
    //Sends a 1 to 1 to multiple users
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
