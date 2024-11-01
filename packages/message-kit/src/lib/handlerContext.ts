import { Conversation, DecodedMessage, Client } from "@xmtp/node-sdk";
import {
  DecodedMessage as DecodedMessageV2,
  Client as ClientV2,
  Conversation as ConversationV2,
} from "@xmtp/xmtp-js";
import { NapiGroupMember } from "@xmtp/node-sdk";
import fs from "fs/promises";
import path from "path";
import type { Reaction } from "@xmtp/content-type-reaction";
import { ContentTypeText } from "@xmtp/content-type-text";
import { logMessage } from "../helpers/utils.js";
import {
  AgentSkill,
  MessageAbstracted,
  GroupAbstracted,
  AbstractedMember,
} from "../helpers/types.js";
import { parseCommand } from "../helpers/utils.js";
import { ContentTypeReply } from "@xmtp/content-type-reply";
import {
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import { ContentTypeReaction } from "@xmtp/content-type-reaction";

export default class HandlerContext {
  private refConv: Conversation | ConversationV2 | null = null;

  message!: MessageAbstracted;
  group!: GroupAbstracted;
  conversation!: ConversationV2;
  client!: Client;
  version!: "v2" | "v3";
  v2client!: ClientV2;
  commands?: AgentSkill[];
  members?: AbstractedMember[];
  sender?: any;
  getMessageById!: (id: string) => DecodedMessage | null;
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
        createdAt: conversation.createdAt,
        addMembersByInboxId:
          conversation.addMembersByInboxId.bind(conversation),
        isAdmin: () => false,
        isSuperAdmin: () => false,
      };
    } else {
      this.conversation = conversation;
    }
  }
  static async loadCommandConfig(
    configPath: string = "skills.js",
  ): Promise<AgentSkill[]> {
    const resolvedPath = path.resolve(process.cwd(), "dist/" + configPath);
    let commands: AgentSkill[] = [];
    try {
      const module = await import(resolvedPath);
      commands = module?.commands ?? [];
    } catch (error) {
      console.error(error);
    }

    return commands;
  }
  static async create(
    conversation: Conversation | ConversationV2,
    message: DecodedMessage | DecodedMessageV2 | null,
    { client, v2client }: { client: Client; v2client: ClientV2 },
    commandsConfigPath?: string,
    version?: "v2" | "v3",
  ): Promise<HandlerContext> {
    const context = new HandlerContext(conversation, { client, v2client });
    if (message) {
      //v2
      const sentAt = "sentAt" in message ? message.sentAt : message.sent;
      let members: any;
      if (version === "v2") {
        context.sender = {
          address: (message as DecodedMessageV2).senderAddress,
          inboxId: (message as DecodedMessageV2).senderAddress,
          installationIds: [],
          accountAddresses: [(message as DecodedMessageV2).senderAddress],
        } as AbstractedMember;
      } else {
        let members = await (conversation as Conversation).members();
        context.members = members.map((member: NapiGroupMember) => ({
          inboxId: member.inboxId,
          address: member.accountAddresses[0],
          accountAddresses: member.accountAddresses,
          installationIds: member.installationIds,
        })) as AbstractedMember[];

        let MemberSender = members?.find(
          (member: NapiGroupMember) =>
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
      context.commands =
        await HandlerContext.loadCommandConfig(commandsConfigPath);

      context.getMessageById =
        client.conversations?.getMessageById?.bind(client.conversations) ||
        (() => null);
      // **Correct Binding:**
      context.getReplyChain = context.getReplyChain.bind(context);

      //trim spaces from text
      let content =
        typeof message.content === "string"
          ? { content: message.content.trim() }
          : message.content;

      if (message.contentType.sameAs(ContentTypeText)) {
        const extractedValues = parseCommand(content.content, context.commands);
        if (extractedValues) {
          content = {
            ...content,
            ...extractedValues,
          };
        }
        //console.log("extractedValues2", content);
      } else if (message.contentType.sameAs(ContentTypeReply)) {
        content = {
          ...content,
          typeId: message.content.contentType.typeId,
        };
      } else if (message.contentType.sameAs(ContentTypeRemoteAttachment)) {
        const attachment = await RemoteAttachmentCodec.load(content, client);
        content = {
          ...content,
          attachment: attachment,
        };
      }

      console.log("sender", context.sender);
      context.message = {
        id: message.id,
        content: content,
        members: members ?? [],
        sender: context.sender,
        typeId: message.contentType.typeId,
        sent: sentAt,
        //@ts-ignore
        version: version,
      };
    }
    return context;
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

    let sender = (await (this.group as Conversation).members())?.find(
      (member: NapiGroupMember) =>
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

  async intent(text: string, conversation?: Conversation) {
    const { commands } = this;
    if (process.env.MSG_LOG) console.log("intent", text);
    if (conversation) this.refConv = conversation;
    try {
      let handler = await this.findHandler(text, commands ?? []);
      const extractedValues = parseCommand(text, commands ?? []);
      //console.log("extractedValues", extractedValues);
      if ((text.startsWith("/") || text.startsWith("@")) && !extractedValues) {
        console.warn("Command not valid", text);
      } else if (handler) {
        // Mock context for command execution
        const mockContext: HandlerContext = {
          ...this,
          conversation: conversation ?? this.conversation,
          message: {
            ...this.message,
            content: {
              ...this.message.content,
              ...extractedValues,
            },
          },
          intent: this.intent.bind(this),
          reply: this.reply.bind(this),
          send: this.send.bind(this),
          sendTo: this.sendTo.bind(this),
          react: this.react.bind(this),
          getMessageById: this.getMessageById.bind(this),
          getReplyChain: this.getReplyChain.bind(this),
        };

        this.refConv = null;
        return await handler.commands[0].handler?.(mockContext);
      } else if (text.startsWith("/") || text.startsWith("@")) {
        console.warn("Command not valid", text);
      } else return this.send(text);
    } catch (e) {
      console.log("error", e);
    } finally {
      this.refConv = null;
    }
  }
  findHandler(text: string, commands: AgentSkill[]): AgentSkill | undefined {
    const trigger = text?.split(" ")[0].toLowerCase();
    for (const AgentSkill of commands) {
      const handler = AgentSkill.commands.find((command) => {
        return command?.triggers?.includes(trigger);
      });
      if (handler) return { ...AgentSkill, commands: [handler] };
    }

    return undefined;
  }
}
