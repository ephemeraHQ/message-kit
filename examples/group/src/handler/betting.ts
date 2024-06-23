import { HandlerContext } from "message-kit";
import { ContentTypeText } from "@xmtp/content-type-text";
import type { User } from "message-kit";

export async function handler(context: HandlerContext) {
  const {
    client,
    message: {
      content: {
        params: { amount, name, username },
      },
      sender,
    },
  } = context;

  if (!amount || !name || !username) {
    context.reply(
      "Missing required parameters. Please provide amount, token, and username.",
    );
    return;
  }

  let addresses = [
    sender.address,
    ...username
      .filter((user: User) => user.address)
      .map((user: User) => user.address!),
  ];

  const conv = await client.conversations.newConversation(addresses);
  await conv.send(`Bet created!\n${name} for $${amount}`, ContentTypeText);
  await conv.send(
    `https://base-frame-lyart.vercel.app/transaction?transaction_type=send&amount=1&token=eth&receiver=0xA45020BdA714c3F43fECDC6e38F873fFF2Dec8ec`,
    ContentTypeText,
  );
  await conv.updateName(`${name} for $${amount}`);

  let groupId = conv.id;
  context.reply(
    `Bet created!. Go to the new group: https://converse.xyz/${groupId}`,
    addresses,
  );
}
