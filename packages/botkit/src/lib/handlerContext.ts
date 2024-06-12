import {
  BotMessage,
  ContentTypeBotMessage,
} from "../content-types/BotMessage.js";
import { Conversation } from "@xmtp/xmtp-js";
import { MessageAbstracted } from "../helpers/types";
import { CommandGroup, User } from "../helpers/types";

export default class HandlerContext {
  message: MessageAbstracted;
  conversation: Conversation;
  context: {
    commands: CommandGroup[];
    users: User[];
  };
  clientAddress: string; // Add this line

  constructor(
    message: MessageAbstracted,
    context: { commands: CommandGroup[]; users: User[] } = {
      commands: [],
      users: [],
    },
    conversation: Conversation,
    clientAddress: string,
  ) {
    this.message = message;
    this.context = context;
    this.conversation = conversation;
    this.clientAddress = clientAddress;
  }

  async textReply(content: any) {
    await this.conversation.send(content);
  }
  async reply(
    message: string,
    receivers: string[] = [],
    messageId: string = "",
  ) {
    const { typeId } = this.message;

    if (typeId == "silent") return;
    const content: BotMessage = {
      receivers: receivers,
      content: message,
      metadata: { ...this.context },
    };

    await this.conversation.send(content, {
      contentType: ContentTypeBotMessage,
    });
  }
}
