import { DecodedMessage } from "@xmtp/xmtp-js";
import { ContentTypeBotMessage } from "../content-types/Bot.js";

export default class HandlerContext {
  message: DecodedMessage;
  context: {};
  clientAddress: string; // Add this line

  constructor(
    message: DecodedMessage,
    context: {} = {},
    clientAddress: string,
  ) {
    this.message = message;
    this.context = context;
    this.clientAddress = clientAddress;
  }

  async textReply(content: any) {
    await this.message.conversation.send(content);
  }
  async reply(
    message: string,
    receivers: string[] = [],
    messageId: string = "",
  ) {
    const { typeId } = this.message.contentType;
    if (typeId == "silent") return;
    const botMessage = {
      sender: this.message.senderAddress,
      receivers: receivers,
      content: message,
      metadata: { ...this.context },
      reference: messageId,
    };

    await this.message.conversation.send(botMessage, {
      contentType: ContentTypeBotMessage,
    });
  }
}
