import { Conversation, DecodedMessage, Client } from "@xmtp/mls-client";
import { DecodedMessage as DecodedMessageV2 } from "@xmtp/xmtp-js";
import {
  BotMessage,
  ContentTypeBotMessage,
} from "../content-types/BotMessage.js";
import { populateUsernames } from "../helpers/usernames.js";
import { ContentTypeText } from "@xmtp/content-type-text";
import {
  CommandGroup,
  User,
  CommandHandlers,
  AgentHandlers,
  MessageAbstracted,
} from "../helpers/types.js";
import { parseIntent } from "../helpers/commands.js";
import { ContentTypeReply } from "@xmtp/content-type-reply";
import {
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";

import { NapiCreateGroupOptions } from "@xmtp/mls-client-bindings-node";

export default class HandlerContext {
  message!: MessageAbstracted;
  conversation!: Conversation;
  client!: Client;
  commands?: CommandGroup[];
  members?: User[];
  commandHandlers?: CommandHandlers;
  agentHandlers?: AgentHandlers;
  getMessageById!: (id: string) => DecodedMessage | null;
  newConversation!: (
    accountAddresses: string[],
    options?: NapiCreateGroupOptions,
  ) => Promise<Conversation>;

  private constructor(
    conversation: Conversation,
    message: DecodedMessage | DecodedMessageV2,
    client: Client,
    commands?: CommandGroup[],
    commandHandlers?: CommandHandlers,
    agentHandlers?: AgentHandlers,
  ) {
    this.client = client;
    this.conversation = conversation;
    this.commandHandlers = commandHandlers;
    this.agentHandlers = agentHandlers;
    this.commands = commands;
  }

  static async create(
    conversation: Conversation,
    message: DecodedMessage | DecodedMessageV2,
    client: Client,
    commands?: CommandGroup[],
    commandHandlers?: CommandHandlers,
    agentHandlers?: AgentHandlers,
  ): Promise<HandlerContext> {
    const context = new HandlerContext(
      conversation,
      message,
      client,
      commands,
      commandHandlers,
      agentHandlers,
    );

    //v2
    const senderAddress =
      "senderAddress" in message
        ? message.senderAddress
        : message.senderInboxId;
    const sentAt = "sentAt" in message ? message.sentAt : message.sent;

    context.members = await populateUsernames(
      conversation.members,
      client.accountAddress,
      senderAddress,
    );

    context.newConversation = client.conversations.newConversation.bind(
      client.conversations,
    );

    context.getMessageById = client.conversations?.getMessageById?.bind(
      client.conversations,
    );

    let content = message.content;
    if (message.contentType.sameAs(ContentTypeText)) {
      content = parseIntent(
        message?.content,
        commands ?? [],
        context.members ?? [],
      );
    } else if (message.contentType.sameAs(ContentTypeReply)) {
      content = {
        ...content,
        typeId: message.content.contentType.typeId,
      };
    } else if (message.contentType.sameAs(ContentTypeRemoteAttachment)) {
      const attachment = await RemoteAttachmentCodec.load(
        message.content,
        client,
      );
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
  }
  async reply(message: string, receivers?: string[]) {
    if (process?.env?.MSG_LOG === "true") {
      console.log(`reply`, message);
    }
    await this.conversation.send(message);
  }

  private async sendMessage(
    message: string | BotMessage,
    conversation?: Conversation,
    contentType?: any,
  ) {
    const targetConversation = conversation ?? this.conversation;
    if (contentType) {
      await targetConversation.send(message, contentType);
    } else {
      await targetConversation.send(message);
    }
  }

  async intent(
    messages: string,
    conversation?: Conversation,
    receivers?: string[],
  ) {
    console.log("intent", messages);
    let splitMessages;

    try {
      splitMessages = JSON.parse(messages);
      if (!Array.isArray(splitMessages)) {
        splitMessages = [messages];
      }
    } catch (e) {
      splitMessages = [messages];
    }
    console.log("splitMessages", splitMessages);

    for (const message of splitMessages) {
      const msg = message as string;
      console.log("msg", msg);
      if (msg.startsWith("/")) {
        await this.handleCommand(msg, conversation);
      } else {
        await this.sendMessage(msg, conversation);
      }
    }
  }
  private async handleCommand(text: string, conversation?: Conversation) {
    const { commands, members } = this;
    if (text.startsWith("/")) {
      let content = parseIntent(text, commands ?? [], members ?? []);
      // Mock context for command execution
      const mockContext: HandlerContext = {
        ...this,
        conversation: conversation ?? this.conversation,
        message: {
          ...this.message,
          content,
        },
        reply: async (message: string) => {
          await (conversation ?? this.conversation).send(message);
        },
        intent: this.intent.bind(this),
      };
      const handler =
        this.commandHandlers?.[
          text.split(" ")[0] as keyof typeof this.commandHandlers
        ];
      if (handler) {
        await handler(mockContext);
      } else {
        await this.reply(
          "Unknown command. Type /help for a list of available commands.",
        );
      }
    } else {
      await this.reply(`${text}`);
    }
    return text;
  }
}
