import { HandlerContext, User } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const {
    members,
    getMessageById,
    message: { content, sender, typeId },
  } = context;

  const msg = await getMessageById(content.reference);
  const replyReceiver = members?.find(
    (member) => member.inboxId === msg?.senderInboxId,
  );

  let amount: number = 0,
    receivers: User[] = [];

  // Handle different types of messages
  if (typeId === "reply") {
    // Process reply messages
    const { content: reply } = content;

    if (reply.includes("$degen") && replyReceiver) {
      receivers = [replyReceiver];
      const match = reply.match(/(\d+)/);
      if (match) amount = parseInt(match[0]); // Extract amount from reply
    }
  } else if (typeId === "text") {
    // Process text commands starting with "/tip"
    const {
      params,
      params: { amount: extractedAmount, username },
      content: text,
    } = content;
    console.log(params);
    if (text.startsWith("/tip")) {
      amount = extractedAmount || 10; // Default amount if not specified
      receivers = username; // Extract receiver from parameters
    }
  } else if (typeId === "reaction" && replyReceiver) {
    const { content: reaction, action } = content;
    // Process reactions, specifically tipping added reactions
    if ((reaction === "🎩" || reaction === "degen") && action === "added") {
      amount = 10; // Set a fixed amount for reactions
      receivers = [replyReceiver];
    }
  }
  if (!sender || receivers.length === 0 || amount === 0) {
    context.reply("Sender or receiver or amount not found.");
    return;
  }
  let receiverAddresses = receivers.map((receiver) => receiver.address);

  // Process sending tokens to each receiver
  receiverAddresses.forEach(async (receiver: any) => {
    context.reply(`You received ${amount} tokens from ${sender.username}.`, {
      receivers: receiverAddresses,
    });
  });
  // Notify sender of the transaction details
  context.reply(
    `You sent ${amount * receiverAddresses.length} tokens in total.`,
    { receivers: [sender.address] },
  );
}
