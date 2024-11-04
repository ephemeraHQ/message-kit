import { HandlerContext } from "@xmtp/message-kit";
import { getUserInfo } from "../lib/resolver.js";

// Main handler function for processing commands
export async function handler(context: HandlerContext) {
  const {
    message: {
      content: { command, params },
    },
  } = context;
  const baseUrl = "https://base-tx-frame.vercel.app/transaction";

  switch (command) {
    case "send":
      // Destructure and validate parameters for the send command
      const { amount: amountSend, token: tokenSend, username } = params; // [!code hl] // [!code focus]
      let senderInfo = await getUserInfo(username);
      if (!amountSend || !tokenSend || !senderInfo) {
        context.reply(
          "Missing required parameters. Please provide amount, token, and username.",
        );
        return;
      }

      let sendUrl = `${baseUrl}/?transaction_type=send&amount=${amountSend}&token=${tokenSend}&receiver=${senderInfo.address}`;
      context.send(`${sendUrl}`);
      break;
    case "swap":
      // Destructure and validate parameters for the swap command
      const { amount, token_from, token_to } = params; // [!code hl] // [!code focus]

      if (!amount || !token_from || !token_to) {
        context.reply(
          "Missing required parameters. Please provide amount, token_from, and token_to.",
        );
        return;
      }

      let swapUrl = `${baseUrl}/?transaction_type=swap&token_from=${token_from}&token_to=${token_to}&amount=${amount}`;
      context.send(`${swapUrl}`);
      break;
    case "show": // [!code hl] // [!code focus]
      // Show the base URL without the transaction path
      context.reply(`${baseUrl.replace("/transaction", "")}`);
      break;
    default:
      // Handle unknown commands
      context.reply("Unknown command. Use help to see all available commands.");
  }
}
