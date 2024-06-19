import {
  xmtpClient,
  HandlerContext as HandlerContext,
} from "@xmtp/message-kit";
import { ContentTypeText } from "@xmtp/content-type-text";

interface User {
  address: string;
  username?: string;
  inboxId?: string;
  accountAddresses?: Array<string>;
  installationIds?: Array<string>;
}

export async function handler(context: HandlerContext) {
  const { content, sender } = context.message;
  const { params } = content;
  const { amount, name, users } = params;

  if (!amount || !name || !users) {
    context.reply(
      "Missing required parameters. Please provide amount, token, and username.",
    );
    return;
  }

  let groupId = await generateBetUrl(users, name, amount);
  context.reply(`Bet created!. Deeplink to groupId: ${groupId}`);
}

async function generateBetUrl(users: User[], betName: string, amount: string) {
  const client = await xmtpClient();
  const conv = await client.conversations.newConversation(
    users.filter((user) => user.inboxId).map((user) => user.inboxId!),
  );
  await conv.send(`Bet created!\n${betName} for $${amount}`, ContentTypeText);
  await conv.send(
    `https://base-frame-lyart.vercel.app/transaction?transaction_type=send&amount=1&token=eth&receiver=0xA45020BdA714c3F43fECDC6e38F873fFF2Dec8ec`,
    ContentTypeText,
  );
  return conv.id;
}
