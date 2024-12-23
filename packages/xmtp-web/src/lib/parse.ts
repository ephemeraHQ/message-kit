import {
  Client as V2Client,
  DecodedMessage as V2DecodedMessage,
  Conversation as V2Conversation,
} from "@xmtp/xmtp-js";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import { Message } from "../types";

export async function parseMessage(
  message: V2DecodedMessage | undefined | null,
  conversation: V2Conversation | undefined,
  client: V2Client,
): Promise<Message | undefined> {
  if (message == null) return undefined;
  let typeId = message.contentType?.typeId ?? "text";
  let content = message.content;
  if (typeId == "text") {
    content = {
      text: content.content ?? content,
    };
  } else if (typeId == "reply") {
    let previousMsg = await getLastMessageById(
      message.content?.reference as string,
      conversation,
      client,
    );
    content = {
      previousMsg: previousMsg,
      reply: content.content,
      text: content.content,
      reference: content.reference,
    };
  } else if (typeId == "reaction") {
    content = {
      reaction: content.content,
      reference: content.reference,
    };
  } else if (message.contentType?.typeId == "remote_attachment") {
    const attachment = await RemoteAttachmentCodec.load(
      message.content,
      client,
    );
    content = {
      attachment: attachment as string,
    };
  } else if (typeId == "read_receipt") {
    //Log read receipt
  } else if (typeId == "agent") {
    content = {
      text: message.content.text,
      metadata: message.content.metadata,
    };
  } else if (typeId == "attachment") {
    const blobdecoded = new Blob([message.content.data], {
      type: message.content.mimeType,
    });
    const url = URL.createObjectURL(blobdecoded);

    content = {
      attachment: url,
    };
  }
  let date = "sentAt" in message ? message.sentAt : message.sent;

  let sender = {
    address: (message as V2DecodedMessage).senderAddress,
    inboxId: (message as V2DecodedMessage).senderAddress,
    installationIds: [],
    accountAddresses: [(message as V2DecodedMessage).senderAddress],
  };

  let convo = {
    id: (conversation as V2Conversation)?.topic,
    topic: (conversation as V2Conversation)?.topic ?? undefined,
    createdAt: (conversation as V2Conversation)?.createdAt as Date,
  };

  let xmtpClient: { address: string; inboxId: string } = {
    address: (client as V2Client).address,
    inboxId: (client as V2Client).address,
  };

  return {
    id: message.id,
    sender: sender,
    conversation: convo,
    group: undefined,
    sent: date as Date,
    content,
    typeId,
    client: xmtpClient,
    version: "v2",
  } as Message;
}

async function getLastMessageById(
  reference: string,
  conversation: V2Conversation | undefined,
  client: V2Client,
): Promise<string | undefined> {
  let msg = await getV2MessageById(
    (conversation as V2Conversation).topic,
    reference,
    client as V2Client,
  );

  if (msg == null) return undefined;
  else return msg.content as string;
}

export async function getV2MessageById(
  conversationId: string,
  reference: string,
  client: V2Client,
): Promise<V2DecodedMessage | undefined> {
  /*Takes to long, deprecated*/
  try {
    const conversations = await client.conversations.list();
    const conversation = conversations.find(
      (conv) => conv.topic === conversationId,
    );
    if (!conversation) return undefined;
    const messages = await conversation.messages();
    return messages.find((m) => m.id === reference) as V2DecodedMessage;
  } catch (error) {
    console.error("Error getting V2 message by id:", error);
    return undefined;
  }
}

export function isV2Conversation(
  conversation: V2Conversation | undefined,
): conversation is V2Conversation {
  return conversation?.topic !== undefined;
}
