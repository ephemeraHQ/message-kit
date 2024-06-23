import { Conversation, DecodedMessage, Client } from "@xmtp/mls-client";
import {
  BotMessage,
  ContentTypeBotMessage,
} from "../content-types/BotMessage.js";
import { populateUsernames } from "../helpers/usernames.js";
import { ContentTypeText } from "@xmtp/content-type-text";
import { CommandGroup, User, MessageAbstracted } from "../helpers/types.js";
import { extractCommandValues } from "../helpers/commands.js";

export default class HandlerContext {
  message: MessageAbstracted;
  conversation: Conversation;
  client: Client;
  commands?: CommandGroup[];
  members?: User[];

  constructor(
    conversation: Conversation,
    message: DecodedMessage,
    client: Client,
    commands?: CommandGroup[],
  ) {
    this.client = client;
    this.conversation = conversation;
    this.members = populateUsernames(
      conversation.members,
      client.accountAddress,
      message.senderInboxId,
    );
    let content = parseCommands(message, commands ?? [], this.members ?? []);
    this.message = {
      id: message.id,
      content: content,
      senderAddress: message.senderInboxId,
      senderInboxId: message.senderInboxId,
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
    if (typeId == "silent") return;
    const content: BotMessage = {
      receivers: receivers ?? [],
      content: message,
    };

    await this.conversation.send(content, ContentTypeBotMessage);
  }
}

function parseCommands(
  message: DecodedMessage,
  commands: CommandGroup[],
  members: User[],
) {
  let content = message.content;
  if (message.contentType.sameAs(ContentTypeText)) {
    if (content?.startsWith("/")) {
      const extractedValues = extractCommandValues(
        content,
        commands ?? [],
        members ?? [],
      );
      content = {
        content: content,
        ...extractedValues,
      };
    } else {
      content = {
        content: content,
      };
    }
  }
  return content;
}
