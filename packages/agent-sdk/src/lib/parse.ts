import { DecodedMessage, Conversation, Client } from "@xmtp/node-sdk";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import { Message, User } from "../types";

export async function parseMessage(
  message: DecodedMessage | undefined | null,
  conversation: Conversation | undefined,
  client: Client,
): Promise<Message | undefined> {
  if (message == null) return undefined;
  let typeId = message.contentType?.typeId ?? "text";
  let content = message.content;
  if (typeId == "text") {
    content = {
      text: content,
    };
  } else if (typeId == "reply") {
    let previousMsg = await client.conversations.getMessageById(
      message.content?.reference as string,
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
  let date = message.sentAt;
  let sender: User | undefined = undefined;

  await conversation?.sync();
  const members = await conversation?.members();
  let membersArray = members?.map((member: any) => ({
    inboxId: member.inboxId,
    address: member.accountAddresses[0],
    accountAddresses: member.accountAddresses,
    installationIds: member.installationIds,
  })) as User[];

  sender = membersArray?.find(
    (member: User) =>
      member.inboxId === (message as DecodedMessage).senderInboxId,
  );
  return {
    id: message.id,
    sender,
    group: {
      id: conversation?.id,
      createdAt: conversation?.createdAt,
      name: conversation?.name,
      members: membersArray,
      admins: conversation?.admins,
      superAdmins: conversation?.superAdmins,
    },
    sent: date as Date,
    content,
    typeId,
    client: {
      address: client.accountAddress,
      inboxId: client.inboxId,
    },
  } as Message;
}
