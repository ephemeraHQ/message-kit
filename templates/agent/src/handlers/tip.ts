import { txpayUrl } from "../skills.js";
import { XMTPContext } from "@xmtp/message-kit";

export async function handleTip(context: XMTPContext) {
  const { address } = context.message.content.params;

  if (!address) {
    return {
      code: 400,
      message: "Missing required parameters. Please provide address.",
    };
  }

  const tipUrl = `${txpayUrl}/${address}`;
  const message = `Send a tip at: ${tipUrl}`;
  context.send(message);
  return { code: 200, message };
}
