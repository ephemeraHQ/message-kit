import { Conversation, DecodedMessage, Client } from "@xmtp/mls-client";
import {
  DecodedMessage as DecodedMessageV2,
  Client as ClientV2,
  Conversation as ConversationV2,
} from "@xmtp/xmtp-js";
import type { Reaction } from "@xmtp/content-type-reaction";
import { populateUsernames } from "../helpers/usernames.js";
import { ContentTypeText } from "@xmtp/content-type-text";
import {
  CommandGroup,
  User,
  CommandHandlers,
  MessageAbstracted,
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
  group!: Conversation;
  conversation!: ConversationV2;
  client!: Client;
  version!: "v2" | "v3";
  v2client!: ClientV2;
  commands?: CommandGroup[];
  isGroup!: boolean;
  members?: User[];
  commandHandlers?: CommandHandlers;
  getMessageById!: (id: string) => DecodedMessage | null;

  private constructor(
    conversation: Conversation | ConversationV2,
    { client, v2client }: { client: Client; v2client: ClientV2 },
    commands?: CommandGroup[],
    commandHandlers?: CommandHandlers,
    version?: "v2" | "v3",
  ) {
    this.client = client;
    this.v2client = v2client;
    this.isGroup = version === "v3";
    if (conversation instanceof Conversation) {
      this.group = conversation;
      this.version = "v3";
    } else {
      this.conversation = conversation;
      this.version = "v2";
    }
    this.commandHandlers = commandHandlers;
    this.commands = commands;
  }

  static async create(
    conversation: Conversation | ConversationV2,
    message: DecodedMessage | DecodedMessageV2 | null,
    { client, v2client }: { client: Client; v2client: ClientV2 },
    commands?: CommandGroup[],
    commandHandlers?: CommandHandlers,
    version?: "v2" | "v3",
  ): Promise<HandlerContext> {
    const context = new HandlerContext(
      conversation,
      { client, v2client },
      commands,
      commandHandlers,
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
        content = parseCommand(content, commands ?? [], context.members ?? []);
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
      };

      return context;
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
      };
    }

    return context;
  }

  async getReplyChain(
    reference: string,
    botAddress?: string,
  ): Promise<{
    chainPrompt: string;
    arrayChain: Array<{ address: string; content: string }>;
    isSenderInChain: boolean;
  }> {
    const msg = await this.getMessageById(reference);
    let sender = this.members?.find(
      (member) => member.inboxId === msg?.senderInboxId,
    );
    if (!msg)
      return {
        chainPrompt: "",
        arrayChain: [],
        isSenderInChain: false,
      };
    let content = msg?.content?.content ?? msg?.content;
    let chain = `${content}\n\n`;
    let isSenderInChainReturn =
      sender?.address.toLowerCase() === botAddress?.toLowerCase();
    let arrayChain: Array<{ address: string; content: string }> = [];
    if (msg?.content?.reference) {
      const { chainPrompt, arrayChain, isSenderInChain } =
        await this.getReplyChain(msg?.content?.reference, botAddress);
      isSenderInChainReturn = isSenderInChainReturn || isSenderInChain;
      let userOrBot = sender?.address === botAddress ? "Bot" : "User";
      chain = `${chainPrompt}\n${userOrBot}:${chain}`;
      arrayChain.push({
        address: sender?.address ?? "",
        content: content,
      });
    }
    return {
      chainPrompt: chain,
      arrayChain: arrayChain,
      isSenderInChain: isSenderInChainReturn,
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
      if (text.startsWith("/")) {
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
        const handler =
          this.commandHandlers?.[
            text.split(" ")[0] as keyof typeof this.commandHandlers
          ];
        if (handler) await handler(mockContext);
        this.refConv = null;
      } else await this.reply(text);
    } catch (e) {
      console.log("error", e);
    } finally {
      this.refConv = null;
    }
  }
}
