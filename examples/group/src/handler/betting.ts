import { HandlerContext } from "@xmtp/message-kit";
import type { User } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const {
    newConversation,
    message: {
      content: {
        params: { amount, name, username, token },
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

  const conv = await newConversation(addresses);
  await conv.updateName(`${name}`);
  await conv.send(`Welcome to the ${name} bet!`);
  await conv.send(`To confirm your bet, click the button below.`);
  await context.intent(`/send ${amount} ${token} to @bot`, conv);
  await context.reply(
    `Bet created!. Go to the new group: https://converse.xyz/${conv.id}`,
  );
}
