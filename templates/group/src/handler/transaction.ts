import { getUserInfo, HandlerContext, SkillResponse } from "@xmtp/message-kit";

// Main handler function for processing
export async function handler(context: HandlerContext): Promise<SkillResponse> {
  const {
    message: {
      content: { skill, params },
    },
  } = context;
  const baseUrl = "https://base-tx-frame.vercel.app/transaction";

  switch (skill) {
    case "send":
      // Destructure and validate parameters for the send
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
      // Destructure and validate parameters for the swap
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
      context.reply("Unknown skill. Use help to see all available skills.");
      return {
        code: 400,
        message: "Unknown skill. Use help to see all available skills.",
      };
  }
}
