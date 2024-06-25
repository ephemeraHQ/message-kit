import { Conversation, DecodedMessage, Client } from "@xmtp/mls-client";
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
import { ContentTypeRemoteAttachment } from "@xmtp/content-type-remote-attachment";

export default class HandlerContext {
  message: MessageAbstracted;
  conversation: Conversation;
  client: Client;
  commands?: CommandGroup[];
  members?: User[];
  commandHandlers?: CommandHandlers;
  agentHandlers?: AgentHandlers;

  constructor(
    conversation: Conversation,
    message: DecodedMessage,
    client: Client,
    commands?: CommandGroup[],
    commandHandlers?: CommandHandlers,
    agentHandlers?: AgentHandlers,
  ) {
    this.client = client;
    this.conversation = conversation;
    this.members = populateUsernames(
      conversation.members,
      client.accountAddress,
      message.senderInboxId,
    );
    this.commandHandlers = commandHandlers;
    this.agentHandlers = agentHandlers;
    console.log(agentHandlers);
    let content = message.content;
    if (message.contentType.sameAs(ContentTypeText)) {
      content = parseIntent(
        message?.content,
        commands ?? [],
        this.members ?? [],
      );
    } else if (message.contentType.sameAs(ContentTypeReply)) {
      content = {
        ...content,
        typeId: message.content.contentType.typeId,
      };
    }
    this.message = {
      id: message.id,
      content: content,
      sender: this.members?.find(
        (member) => member.inboxId === message.senderInboxId,
      ) as User,
      typeId: message.contentType.typeId,
      sent: message.sentAt,
    };
    this.commands = commands;
  }

  async reply(message: string, receivers?: string[]) {
    await this.conversation.send(message, ContentTypeText);
  }

  async botReply(message: string, receivers?: string[]) {
    const { typeId } = this.message;
    if (typeId === "silent") return;
    const content: BotMessage = {
      receivers: receivers ?? [],
      content: message,
    };

    await this.conversation.send(content, ContentTypeBotMessage);
  }

  async handleAgent(text: string) {
    if (text.startsWith("@")) {
      const handler =
        this.agentHandlers?.[
          text.split(" ")[0] as keyof typeof this.agentHandlers
        ];
      if (handler) {
        await handler(this);
      } else {
        this.reply(
          "Unknown command. Type /help for a list of available commands.",
        );
      }
    } else {
      await this.reply(`${text}`);
    }
    return text;
  }

  async handleCommand(text: string) {
    const {
      commands,
      members,
      message: { id, sender, sent },
    } = this;
    if (text.startsWith("/")) {
      let content = parseIntent(text, commands ?? [], members ?? []);
      // Mock context for command execution
      const mockContext: HandlerContext = {
        ...this,
        message: {
          ...this.message,
          content,
        },
        reply: this.reply.bind(this),
        botReply: this.botReply.bind(this),
        handleAgent: this.handleAgent.bind(this),
        handleCommand: this.handleCommand.bind(this),
      };
      const handler =
        this.commandHandlers?.[
          text.split(" ")[0] as keyof typeof this.commandHandlers
        ];
      if (handler) {
        await handler(mockContext);
      } else {
        this.reply(
          "Unknown command. Type /help for a list of available commands.",
        );
      }
    } else {
      await this.reply(`${text}`);
    }
    return text;
  }
}
