import { Conversation, DecodedMessage } from "@xmtp/xmtp-js";
import { MessageAbstractedV2 } from "../helpers/types.js";
import { CommandGroup, User, MessageAbstracted } from "../helpers/types.js";
import { extractCommandValues } from "../helpers/commands.js";

export default class HandlerContext {
  message: MessageAbstractedV2;
  conversation: Conversation;
  clientAddress: string;

  constructor(
    conversation: Conversation,
    message: DecodedMessage,
    clientAddress: string,
  ) {
    let content = parseCommands(message, commands ?? [], this.members ?? []);
    this.conversation = conversation;
    this.message = {
      id: message.id,
      content: content,
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
