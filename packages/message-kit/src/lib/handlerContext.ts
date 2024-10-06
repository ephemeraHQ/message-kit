import { Conversation, DecodedMessage, Client } from "@xmtp/mls-client";
import {
  DecodedMessage as DecodedMessageV2,
  Client as ClientV2,
  Conversation as ConversationV2,
} from "@xmtp/xmtp-js";
import fs from "fs/promises";
import path from "path";
import type { Reaction } from "@xmtp/content-type-reaction";
import { populateUsernames } from "../helpers/usernames.js";
import { ContentTypeText } from "@xmtp/content-type-text";
import {
  CommandGroup,
  User,
  MessageAbstracted,
  GroupAbstracted,
} from "../helpers/types.js";
import { parseCommand } from "../helpers/commands.js";
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
  commands?: CommandGroup[];
  isGroup!: boolean;
  members?: User[];
  getMessageById!: (id: string) => DecodedMessage | null;
  private constructor(
    conversation: Conversation | ConversationV2,
    { client, v2client }: { client: Client; v2client: ClientV2 },
    version?: "v2" | "v3",
  ) {
    this.client = client;
    this.v2client = v2client;
    this.isGroup = version === "v3";
    if (conversation instanceof Conversation) {
      this.group = {
        sync: conversation.sync.bind(conversation),
        addMembers: conversation.addMembers.bind(conversation),
        addMembersByInboxId:
          conversation.addMembersByInboxId.bind(conversation),
        removeMembers: conversation.removeMembers.bind(conversation),
        removeMembersByInboxId:
          conversation.removeMembersByInboxId.bind(conversation),
      };
      this.version = "v3";
    } else {
      this.conversation = conversation;
      this.version = "v2";
    }
  }
  static async loadCommandConfig(
    configPath: string = "commands.js",
  ): Promise<CommandGroup[]> {
    const resolvedPath = path.resolve(process.cwd(), "dist/" + configPath);

    try {
      const module = await import(resolvedPath);
      const commandConfig = module.commands; // Access the exported variable

      return commandConfig;
    } catch (error) {
      console.error(
        `Failed to load command configuration from ${resolvedPath}:`,
        error,
      );
      return [];
    }
  }
  static async create(
    conversation: Conversation | ConversationV2,
    message: DecodedMessage | DecodedMessageV2 | null,
    { client, v2client }: { client: Client; v2client: ClientV2 },
    commandsConfigPath?: string,
    version?: "v2" | "v3",
  ): Promise<HandlerContext> {
    const context = new HandlerContext(
      conversation,
      { client, v2client },
      version,
    );
    if (message) {
      //v2
      const senderAddress =
        "senderAddress" in message
          ? message.senderAddress
          : message.senderInboxId;
      const sentAt = "sentAt" in message ? message.sentAt : message.sent;

      context.members = await populateUsernames(
        "members" in conversation ? conversation.members : [],
        client.accountAddress,
        senderAddress,
      );

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
          ? message.content.trim()
          : message.content;

      if (message.contentType.sameAs(ContentTypeText)) {
        content = parseCommand(
          content,
          context.commands ?? [],
          context.members ?? [],
        );
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

      //v2
      const sender =
        context.members?.find((member) => member.inboxId === senderAddress) ||
        ({ address: senderAddress, inboxId: senderAddress } as User);

      context.message = {
        id: message.id,
        content: content,
        sender: sender,
        typeId: message.contentType.typeId,
        sent: sentAt,
        version: version as string,
      };
    } else {
      context.message = {
        id: "",
        content: "",
        sender: {
          inboxId: "",
          address: "",
          username: "",
          accountAddresses: [],
        },
        typeId: "new_" + (context.isGroup ? "group" : "conversation"),
        sent: conversation.createdAt,
        version: version as string,
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

    let sender = this.members?.find(
      (member) =>
        member.inboxId === (msg as DecodedMessage).senderInboxId ||
        member.address === (msg as DecodedMessageV2).senderAddress,
    );
    senderAddress = sender?.address ?? "";

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

    /*console.log(
      this.version,
      this.isConversationV2(conversation),
      this.refConv,
      this.conversation,
      this.group,
    );*/
    if (conversation) {
      if (this.isConversationV2(conversation)) {
        await conversation.send(reply, { contentType: ContentTypeReply });
      } else if (conversation instanceof Conversation) {
        await conversation.send(reply, ContentTypeReply);
      }
    }
  }

  async send(message: string) {
    const conversation = this.refConv || this.conversation || this.group;
    if (conversation) await conversation.send(message);
  }

  isConversationV2(conversation: any): conversation is ConversationV2 {
    return conversation?.topic !== undefined;
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
      const stats = await fs.stat(".cache");
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
      if (this.v2client.address.toLowerCase() === receiver.toLowerCase())
        continue;
      if (this.refConv) await this.refConv.send(message);

      let targetConversation = conversations.find(
        (conv) => conv.peerAddress === receiver,
      );
      if (!targetConversation)
        targetConversation =
          await this.v2client.conversations.newConversation(receiver);
      if (targetConversation) await targetConversation.send(message);
    }
  }

  async intent(text: string, conversation?: Conversation) {
    const { commands, members } = this;
    if (conversation) this.refConv = conversation;
    try {
      const handler = this.commands?.find((command) =>
        command.triggers?.includes(text.split(" ")[0]),
      );
      if (handler) {
        let content = parseCommand(text, commands ?? [], members ?? []);
        // Mock context for command execution
        const mockContext: HandlerContext = {
          ...this,
          conversation: conversation ?? this.conversation,
          message: {
            ...this.message,
            content,
          },
          intent: this.intent.bind(this),
          reply: this.reply.bind(this),
          send: this.send.bind(this),
          sendTo: this.sendTo.bind(this),
          react: this.react.bind(this),
          getMessageById: this.getMessageById.bind(this),
          getReplyChain: this.getReplyChain.bind(this),
          isGroup: this.group instanceof Conversation,
        };
        /*OLDconst handler =
          this.commandHandlers?.[
            text.split(" ")[0] as keyof typeof this.commandHandlers
          ];
        */
        await handler.commands[0].handler?.(mockContext);
        this.refConv = null;
      } else await this.reply(text);
    } catch (e) {
      console.log("error", e);
    } finally {
      this.refConv = null;
    }
  }
}
