import { Conversation, DecodedMessage } from "@xmtp/mls-client";
import { ContentTypeBotMessage } from "../content-types/Bot.js";
import { ContentTypeText } from "@xmtp/xmtp-js";
import { ContentTypeSilent } from "../content-types/Silent.js";

export class HandlerContext {
  message: DecodedMessage;
  conversation: Conversation;
  clientAddress: string; // Add this line

  constructor(message: DecodedMessage, clientAddress: string) {
    this.message = message;
    this.conversation = message.conversation;
    this.clientAddress = clientAddress;
  }

  async textReply(message: string) {
    await this.conversation.send(message, ContentTypeText);
  }

  async reply(
    message: string,
    receivers: string[] = [],
    messageId: string = "",
  ) {
    if (this.message.contentType.sameAs(ContentTypeSilent)) return;

    const botMessage = {
      sender: this.message.senderInboxId,
      receivers: receivers,
      content: message,
      metadata: {},
      reference: messageId,
    };

    await this.conversation.send(botMessage, ContentTypeBotMessage);
  }
}
