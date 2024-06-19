import { MlsHandlerContext as HandlerContext } from "@xmtp/message-kit";
export async function handler(context: HandlerContext) {
  const { members } = context;

  const { sender, content, typeId } = context.message;
  const { params } = content;
  let amount: number = 0,
    receiverAddresses: string[] = [];
  // Handle different types of messages
  if (typeId === "reply") {
    // Extracts amount from reply //  [!code hl] // [!code focus]
    const { content: reply, referenceInboxId: receiver } = content;
    // Process reply messages
    receiverAddresses = [receiver];
    if (reply.includes("$degen")) {
      const match = reply.match(/(\d+)/);
      if (match) amount = parseInt(match[0]); // Extract amount from reply
    }
  } else if (typeId === "text") {
    // Uses tip command //  [!code hl] // [!code focus]
    const { content: text } = content;
    // Process text commands starting with "/tip"
    if (text.startsWith("/tip")) {
      const { amount: extractedAmount, username } = params;
      amount = extractedAmount || 10; // Default amount if not specified
      receiverAddresses = username; // Extract receiver from parameters
    }
  } else if (typeId === "reaction") {
    // Uses reaction emoji to tip //  [!code hl] // [!code focus]
    const { content: reaction, action, referenceInboxId: receiver } = content;

    // Process reactions, specifically tipping added reactions
    if ((reaction === "🎩" || reaction === "degen") && action === "added") {
      amount = 10; // Set a fixed amount for reactions
      receiverAddresses = [receiver];
    }
  }
  // Find sender user details
  const senderUser = members?.find((user: any) => user.inboxId === sender);

  if (!senderUser || receiverAddresses.length === 0 || amount === 0) {
    context.reply("Sender or receiver or amount not found.");
    return;
  }

  // Process sending tokens to each receiver
  receiverAddresses.forEach(async (receiver: any) => {
    context.reply(
      `You received ${amount} tokens from ${senderUser.username}.`,
      [receiver?.address], // Notify only 1 address
    );
  });
  // Notify sender of the transaction details
  context.reply(
    `You sent ${amount} tokens in total.`,
    [senderUser.address], // Notify only 1 address //  [!code hl] // [!code focus]
  );
}
