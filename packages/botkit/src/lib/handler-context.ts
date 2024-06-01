import { DecodedMessage } from "@xmtp/xmtp-js";
import { ContentTypeBotMessage } from "../content-types/Bot.js";
import { ContentTypeSilent } from "../content-types/Silent.js";

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
  async grant_access(content: any) {
    let acceptAccess = {
      content: "grant_access",
      sender: content.sender,
      reference: content.reference,
      metadata: { hello: "world" },
    };
    await this.message.conversation.send(acceptAccess, {
      contentType: ContentTypeSilent,
    });
  }
  async reply(
    message: string,
    receivers: string[] = [],
    messageId: string = "",
  ) {
    let context = JSON.stringify(this.context);
    const botMessage = {
      sender: this.message.senderAddress,
      receivers: receivers, // Assuming receiver is available in context
      content: message,
      context,
      reference: messageId,
    };

    await this.message.conversation.send(botMessage, {
      contentType: ContentTypeBotMessage,
    });
  }
}
