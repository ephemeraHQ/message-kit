import { HandlerContext as HandlerContext } from "@xmtp/message-kit";
const baseUrl = "https://base-frame-lyart.vercel.app/transaction";

// Main handler function for processing commands
export function handler(context: HandlerContext) {
  const { content } = context.message;
  const { params, command } = content;
  let url = "";

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
      url = generateFrameURL(baseUrl, "send", {
        amount: amountSend,
        token: tokenSend,
        receiver: username[0]?.address,
      });
      context.reply(`${url}`);
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
      url = generateFrameURL(baseUrl, "swap", {
        amount,
        token_from,
        token_to,
      });
      context.reply(`${url}`);
      break;
    case "mint":
      // Destructure and provide default values for the mint command
      const { collection, tokenId } = params; // [!code hl] // [!code focus]

      if (!collection || !tokenId) {
        context.reply(
          "Missing required parameters. Please provide collection address and token id.",
        );
        return;
      }
      // Generate URL for the mint transaction
      url = generateFrameURL(baseUrl, "mint", {
        collection,
        token_id: tokenId,
      });
      context.reply(url);
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
  params: any,
) {
  // Filter out undefined parameters
  let filteredParams: { [key: string]: any } = {};

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
