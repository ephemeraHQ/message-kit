import { Conversation, DecodedMessage, Client } from "@xmtp/mls-client";
import {
  DecodedMessage as DecodedMessageV2,
  Client as ClientV2,
} from "@xmtp/xmtp-js";
import { Reaction } from "@xmtp/content-type-reaction";
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
import { ContentTypeReaction } from "@xmtp/content-type-reaction";

export default class HandlerContext {
  message!: MessageAbstracted;
  conversation!: Conversation;
  client!: Client;
  v2client!: ClientV2;
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
    { client, v2client }: { client: Client; v2client: ClientV2 },
    commands?: CommandGroup[],
    commandHandlers?: CommandHandlers,
    agentHandlers?: AgentHandlers,
  ) {
    this.client = client;
    this.v2client = v2client;
    this.conversation = conversation;
    this.commandHandlers = commandHandlers;
    this.agentHandlers = agentHandlers;
    this.commands = commands;
  }

  static async create(
    conversation: Conversation,
    message: DecodedMessage | DecodedMessageV2,
    { client, v2client }: { client: Client; v2client: ClientV2 },
    commands?: CommandGroup[],
    commandHandlers?: CommandHandlers,
    agentHandlers?: AgentHandlers,
  ): Promise<HandlerContext> {
    const context = new HandlerContext(
      conversation,
      message,
      { client, v2client },
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

    context.getMessageById =
      client.conversations?.getMessageById?.bind(client.conversations) ||
      (() => null);

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
  async sendReaction(reaction: string, messageId: string) {
    await this.reply(
      {
        content: reaction,
        action: "added",
        reference: messageId,
        schema: "unicode",
      },
      { contentType: ContentTypeReaction },
    );
  }

  async reply(
    message: string | BotMessage | Reaction,
    options?: {
      conversation?: Conversation;
      contentType?: any;
      receivers?: string[];
    },
  ) {
    const { conversation, contentType, receivers } = options ?? {};
    if (receivers) {
      for (const receiver of receivers) {
        if (this.v2client.address.toLowerCase() === receiver.toLowerCase())
          continue;
        const targetConversation =
          await this.v2client.conversations.newConversation(receiver);
        if (contentType) {
          await targetConversation.send(message, contentType);
        } else {
          await targetConversation.send(message);
        }
      }
    } else {
      const targetConversation = conversation ?? this.conversation;
      if (contentType) {
        await targetConversation.send(message, contentType);
      } else {
        await targetConversation.send(message);
      }
    }
  }

  async intent(
    messages: string,
    options?: {
      conversation?: Conversation;
      receivers?: string[];
    },
  ) {
    let splitMessages = [messages];
    const { conversation, receivers } = options ?? {};
    try {
      if (Array.isArray(JSON.parse(messages)))
        splitMessages = JSON.parse(messages);
      if (process?.env?.MSG_LOG === "true") {
        console.log("splitMessages", splitMessages);
      }
    } catch (e) {}

    for (const message of splitMessages) {
      const msg = message as string;
      if (msg.startsWith("/")) {
        await this.handleCommand(msg, { conversation, receivers });
      } else {
        await this.reply(msg, { conversation, receivers });
      }
    }
  }
  private async handleCommand(
    text: string,
    options?: {
      conversation?: Conversation;
      receivers?: string[];
    },
  ) {
    const { commands, members } = this;
    const { conversation, receivers } = options ?? {};
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
        reply: (message, opts) => {
          this.reply(message, {
            ...opts,
            conversation: conversation ?? this.conversation, // Ensure conversation is passed
          });
        },
        sendReaction: this.sendReaction.bind(this),
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
      await this.reply(`${text}`, { conversation, receivers });
    }
    return text;
  }
}
