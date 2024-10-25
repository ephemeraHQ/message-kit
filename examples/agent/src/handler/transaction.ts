import { HandlerContext } from "@xmtp/message-kit";

// Main handler function for processing commands
export async function handler(context: HandlerContext) {
  const {
    message: {
      content: { command, params },
    },
  } = context;
  const baseUrl = "https://base-frame-lyart.vercel.app/transaction";

  switch (command) {
    case "send":
      // Destructure and validate parameters for the send command
      const { amount: amountSend, token: tokenSend, username } = params; // [!code hl] // [!code focus]

      if (!amountSend || !tokenSend || !username) {
        context.reply(
          "Missing required parameters. Please provide amount, token, and username.",
        );
        return;
      }
      // Generate URL for the send transaction
      let url_send = generateFrameURL(baseUrl, "send", {
        amount: amountSend,
        token: tokenSend,
        receiver: username[0]?.address,
      });
      context.reply(`${url_send}`);
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
      // Generate URL for the swap transaction
      let url_swap = generateFrameURL(baseUrl, "swap", {
        amount,
        token_from,
        token_to,
      });
      context.reply(`${url_swap}`);
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

// Function to generate a URL with query parameters for transactions
function generateFrameURL(
  baseUrl: string,
  transaction_type: string,
  params: { [key: string]: string | number | string[] | undefined },
) {
  // Filter out undefined parameters
  let filteredParams: {
    [key: string]: string | number | string[] | undefined;
  } = {};

  for (const key in params) {
    if (params[key] !== undefined) {
      filteredParams[key] = params[key];
    }
  }
  let queryParams = new URLSearchParams({
    transaction_type,
    ...filteredParams,
  }).toString();
  return `${baseUrl}?${queryParams}`;
}
