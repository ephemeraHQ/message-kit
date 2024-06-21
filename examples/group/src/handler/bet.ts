import { HandlerContext } from "@xmtp/message-kit";
import { ContentTypeText } from "@xmtp/content-type-text";

interface User {
  address: string;
  username?: string;
  inboxId?: string;
  accountAddresses?: Array<string>;
  installationIds?: Array<string>;
}

export async function handler(context: HandlerContext) {
  const {
    client,
    members,
    message: {
      content: {
        params: { amount, name, users },
      },
      senderInboxId,
    },
  } = context;

  if (!amount || !name || !users) {
    context.reply(
      "Missing required parameters. Please provide amount, token, and username.",
    );
    return;
  }
  let inboxIds = users
    .filter((user: User) => user.inboxId)
    .map((user: User) => user.inboxId!);
  inboxIds.push(
    members?.find((user: User) => user.inboxId === senderInboxId)?.address,
  );
  const conv = await client.conversations.newConversation(inboxIds);
  await conv.send(`Bet created!\n${name} for $${amount}`, ContentTypeText);
  await conv.send(
    `https://base-frame-lyart.vercel.app/transaction?transaction_type=send&amount=1&token=eth&receiver=0xA45020BdA714c3F43fECDC6e38F873fFF2Dec8ec`,
    ContentTypeText,
  );

  let groupId = conv.id;
  context.reply(
    `Bet created!. Deeplink to groupId: https://converse.xyz/${groupId}`,
  );
}
