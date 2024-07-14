import { HandlerContext } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const {
    getMessageById,
    message: { content, sender, typeId },
  } = context;

  const msg = await getMessageById(content.reference);

  let amount: number = 0,
    receiverAddresses: string[] = [];
  // Handle different types of messages
  if (typeId === "reply") {
    // Process reply messages
    const { content: reply } = content;
    receiverAddresses = [msg?.senderInboxId ?? ""];
    if (reply.includes("$degen")) {
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
      receiverAddresses = username; // Extract receiver from parameters
    }
  } else if (typeId === "reaction") {
    const { content: reaction, action } = content;
    // Process reactions, specifically tipping added reactions
    if ((reaction === "🎩" || reaction === "degen") && action === "added") {
      amount = 10; // Set a fixed amount for reactions
      receiverAddresses = [msg?.senderInboxId ?? ""];
    }
  }
  if (!sender || receiverAddresses.length === 0 || amount === 0) {
    context.reply("Sender or receiver or amount not found.");
    return;
  }

  // Process sending tokens to each receiver
  /*receiverAddresses.forEach(async (receiver: string) => {
    context.reply(
      `You received ${amount} tokens from ${senderUser.username}.`,
      [receiver?.address], // Notify only 1 address
    );
  });*/
  // Notify sender of the transaction details
  context.reply(
    `You sent ${amount * receiverAddresses.length} tokens in total.`,
    [sender.address], // Notify only 1 address //  [!code hl] // [!code focus]
  );
}
