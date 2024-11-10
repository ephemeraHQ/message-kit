import { getUserInfo, HandlerContext, SkillResponse } from "@xmtp/message-kit";

// Main handler function for processing commands
export async function handler(context: HandlerContext): Promise<SkillResponse> {
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
        return {
          code: 400,
          message:
            "Missing required parameters. Please provide amount, token, and username.",
        };
      }

      let sendUrl = `${baseUrl}/?transaction_type=send&amount=${amountSend}&token=${tokenSend}&receiver=${senderInfo.address}`;
      context.send(`${sendUrl}`);
      return {
        code: 200,
        message: `${sendUrl}`,
      };
    case "swap":
      // Destructure and validate parameters for the swap command
      const { amount, token_from, token_to } = params; // [!code hl] // [!code focus]

      if (!amount || !token_from || !token_to) {
        context.reply(
          "Missing required parameters. Please provide amount, token_from, and token_to.",
        );
        return {
          code: 400,
          message:
            "Missing required parameters. Please provide amount, token_from, and token_to.",
        };
      }

      let swapUrl = `${baseUrl}/?transaction_type=swap&token_from=${token_from}&token_to=${token_to}&amount=${amount}`;
      context.send(`${swapUrl}`);
      return {
        code: 200,
        message: `${swapUrl}`,
      };
    case "show": // [!code hl] // [!code focus]
      // Show the base URL without the transaction path
      context.reply(`${baseUrl.replace("/transaction", "")}`);
      return {
        code: 200,
        message: `${baseUrl.replace("/transaction", "")}`,
      };
    default:
      // Handle unknown commands
      context.reply("Unknown command. Use help to see all available commands.");
      return {
        code: 400,
        message: "Unknown command. Use help to see all available commands.",
      };
  }
}
