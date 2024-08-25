import { HandlerContext } from "@xmtp/message-kit";
import type { User } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const {
    message: {
      content: {
        params: { amount, name, username, token },
      },
      sender,
    },
    client,
    v2client,
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

  const group = await client?.conversations.newConversation(addresses);
  await group.updateName(`${name}`);
  await group.send(`Welcome to the ${name} bet!`);
  await group.send(`To confirm your bet, click the button below.`);
  await context.intent(`/send ${amount} ${token} to @bot`, group);
  await context.reply(
    `Bet created!. Go to the new group: https://converse.xyz/group-invite/${group.id}`,
  );
}
