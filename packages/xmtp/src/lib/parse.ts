import {
  DecodedMessage as V3DecodedMessage,
  Conversation as V3Conversation,
  Client as V3Client,
} from "@xmtp/node-sdk";
import {
  DecodedMessage as V2DecodedMessage,
  Conversation as V2Conversation,
  Client as V2Client,
} from "@xmtp/xmtp-js";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import { Message, User } from "./types";

export async function parseMessage(
  message: V3DecodedMessage | V2DecodedMessage | undefined | null,
  conversation: V3Conversation | V2Conversation | undefined,
  client: V3Client | V2Client,
): Promise<Message | undefined> {
  if (message == null) return undefined;
  let typeId = message.contentType?.typeId ?? "text";
  let content = message.content;
  if (typeId == "text") {
    content = {
      text: content,
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

  let sender: User | undefined = undefined;

  if (isV2Conversation(conversation)) {
    sender = {
      address: (message as V2DecodedMessage).senderAddress,
      inboxId: (message as V2DecodedMessage).senderAddress,
      installationIds: [],
      accountAddresses: [(message as V2DecodedMessage).senderAddress],
    };
  } else {
    let group = await (conversation as V3Conversation);
    await group.sync();
    const members = await group.members();
    let membersArray = members.map((member: any) => ({
      inboxId: member.inboxId,
      address: member.accountAddresses[0],
      accountAddresses: member.accountAddresses,
      installationIds: member.installationIds,
    })) as User[];

    sender = membersArray?.find(
      (member: User) =>
        member.inboxId === (message as V3DecodedMessage).senderInboxId,
    );
  }
  let group = undefined;
  if (conversation instanceof V3Conversation) {
    group = {
      id: (conversation as V3Conversation)?.id,
      createdAt: (conversation as V3Conversation)?.createdAt,
      name: (conversation as V3Conversation)?.name,
      members: (conversation as V3Conversation)?.members,
      admins: (conversation as V3Conversation)?.admins,
      superAdmins: (conversation as V3Conversation)?.superAdmins,
    };
  }
  let convo = {
    id:
      (conversation as V3Conversation)?.id ??
      (conversation as V2Conversation)?.topic,
    topic: (conversation as V2Conversation)?.topic ?? undefined,
    createdAt:
      ((conversation as V2Conversation)?.createdAt as Date) ||
      ((conversation as V3Conversation)?.createdAt as Date),
  };

  return {
    id: message.id,
    sender: sender,
    conversation: convo,
    group: group,
    sent: date as Date,
    content,
    typeId,
    version: group ? "v3" : "v2",
  } as Message;
}

async function getLastMessageById(
  reference: string,
  conversation: V3Conversation | V2Conversation | undefined,
  client: V3Client | V2Client,
): Promise<string | undefined> {
  let isV2 = isV2Conversation(conversation);
  let msg = isV2
    ? await getV2MessageById(
        (conversation as V2Conversation).topic,
        reference,
        client as V2Client,
      )
    : ((await client) as V3Client).conversations.getMessageById(reference);

  if (msg == null) return undefined;
  else return msg.content as string;
}

export function isV2Conversation(
  conversation: V3Conversation | V2Conversation | undefined,
): conversation is V2Conversation {
  return (conversation as V2Conversation)?.topic !== undefined;
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
