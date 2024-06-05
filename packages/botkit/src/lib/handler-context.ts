import { ContentTypeBotMessage } from "../content-types/Bot.js";
import { DecodedMessage } from "@xmtp/xmtp-js";

type Conversation = {
  send: (content: any, options?: any) => Promise<DecodedMessage<any>>;
};

// Define a type for the message that includes the conversation property
type Message = {
  id: string;
  sent: Date;
  content: any;
  senderAddress: string;
  typeId: string;
};

export default class HandlerContext {
  message: Message;
  conversation: Conversation;
  context: {};
  clientAddress: string; // Add this line

  constructor(
    message: Message,
    context: {} = {},
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
    const botMessage = {
      sender: this.message.senderAddress,
      receivers: receivers,
      content: message,
      metadata: { ...this.context },
      reference: messageId,
    };

    await this.conversation.send(botMessage, {
      contentType: ContentTypeBotMessage,
    });
  }
}
