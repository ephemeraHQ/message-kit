import {
  HandlerContext,
  AbstractedMember,
  SkillResponse,
} from "@xmtp/message-kit";
import { getUserInfo } from "@xmtp/message-kit";

export async function handler(context: HandlerContext): Promise<SkillResponse> {
  const {
    members,
    getMessageById,
    message: {
      content: { reference, reply, text, params },
      sender,
      typeId,
    },
  } = context;
  const msg = reference ? await getMessageById(reference) : undefined;
  const replyReceiver = members?.find(
    (member) => member.inboxId === msg?.senderInboxId,
  );
  let amount: number = 0,
    receivers: AbstractedMember[] = [];
  // Handle different types of messages
  if (typeId === "reply" && replyReceiver) {
    if (reply?.includes("degen")) {
      receivers = [replyReceiver];
      const match = reply.match(/(\d+)/);
      if (match)
        amount = parseInt(match[0]); // Extract amount from reply
      else amount = 10;
    }
  } else if (typeId === "text" && text?.startsWith("/tip") && params) {
    // Process text skills starting with "/tip"
    const { amount: extractedAmount, username } = params;
    amount = extractedAmount || 10; // Default amount if not specified

    receivers = await Promise.all(
      username.map((username: string) => getUserInfo(username)),
    );
  }
  if (!sender || receivers.length === 0 || amount === 0) {
    context.reply("Sender or receiver or amount not found.");
    return {
      code: 400,
      message: "Sender or receiver or amount not found.",
    };
  }
  const receiverAddresses = receivers.map((receiver) => receiver.address);
  // Process sending tokens to each receiver

  context.sendTo(
    `You received ${amount} tokens from ${sender.address}.`,
    receiverAddresses,
  );

  // Notify sender of the transaction details
  context.sendTo(
    `You sent ${amount * receiverAddresses.length} tokens in total.`,
    [sender.address],
  );
  return {
    code: 200,
    message: "Success",
  };
}
