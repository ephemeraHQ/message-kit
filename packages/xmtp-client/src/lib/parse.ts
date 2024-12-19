import { DecodedMessage, Conversation } from "@xmtp/xmtp-js";
import { Message, User } from "./types";

export async function parseMessage(
  message: DecodedMessage | undefined | null,
): Promise<Message | undefined> {
  if (message == null) return undefined;

  let typeId = message.contentType?.typeId ?? "text";
  let content = message.content;

  // Handle text messages
  if (typeId === "text") {
    content = {
      text: content,
    };
  }

  const sender: User = {
    address: message.senderAddress,
    inboxId: message.senderAddress,
    installationIds: [],
    accountAddresses: [message.senderAddress],
  };

  const conversation = {
    id: message.conversation?.topic,
    topic: message.conversation?.topic,
    createdAt: message.conversation?.createdAt as Date,
  };

  return {
    id: message.id,
    sender,
    conversation,
    group: undefined,
    sent: message.sent as Date,
    content,
    typeId,
    version: "v2",
  } as Message;
}

export function isV2Conversation(
  conversation: Conversation | undefined,
): conversation is Conversation {
  return conversation?.topic !== undefined;
}
