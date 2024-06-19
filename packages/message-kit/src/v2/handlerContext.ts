import { Conversation, DecodedMessage } from "@xmtp/xmtp-js";
import { MessageAbstractedV2 } from "../helpers/types.js";

export default class HandlerContext {
  message: MessageAbstractedV2;
  conversation: Conversation;
  clientAddress: string;

  constructor(
    conversation: Conversation,
    message: DecodedMessage,
    clientAddress: string,
  ) {
    this.conversation = conversation;
    this.message = {
      id: message.id,
      content: message.content,
      senderAddress: message.senderAddress,
      typeId: message.contentType.typeId,
      sent: message.sent,
    };
    this.clientAddress = clientAddress ?? "";
  }

  async reply(content: any) {
    await this.conversation.send(content);
  }
}
