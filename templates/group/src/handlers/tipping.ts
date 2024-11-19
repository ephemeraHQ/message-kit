import { XMTPContext, AbstractedMember } from "@xmtp/message-kit";
import { getUserInfo } from "@xmtp/message-kit";

export async function handleTipping(context: XMTPContext) {
  const {
    message: {
      content: {
        skill,
        params: { amount, username },
      },
      sender,
    },
  } = context;
  let receivers: AbstractedMember[] = [];

  receivers = await Promise.all(
    username.map((username: string) => getUserInfo(username)),
  );

  if (!sender || receivers.length === 0 || amount === 0) {
    context.reply("Sender or receiver or amount not found.");
  }
  const receiverAddresses = receivers.map((receiver) => receiver.address);

  context.sendTo(
    `You received ${amount} tokens from ${sender.address}.`,
    receiverAddresses,
  );

  // Notify sender of the transaction details
  context.sendTo(
    `You sent ${amount * receiverAddresses.length} tokens in total.`,
    [sender.address],
  );
}
