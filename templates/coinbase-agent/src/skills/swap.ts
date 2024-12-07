import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { baseUrl } from "../index.js";

export const registerSkill: Skill[] = [
  {
    skill: "/swap [amount] [token_from] [token_to]",
    examples: ["/swap 10 usdc eth", "/swap 1 dai usdc"],
    handler: handler,
    description: "Exchange one type of cryptocurrency for another.",
    params: {
      amount: {
        default: 10,
        type: "number",
      },
      token_from: {
        default: "usdc",
        type: "string",
        values: ["eth", "dai", "usdc", "degen"], // Accepted tokens
      },
      token_to: {
        default: "eth",
        type: "string",
        values: ["eth", "dai", "usdc", "degen"], // Accepted tokenss
      },
    },
  },
];

export async function handler(context: XMTPContext) {
  // Destructure and validate parameters for the swap command
  const {
    message: {
      content: { params },
    },
  } = context;

  const { amount, token_from, token_to } = params;

  if (!amount || !token_from || !token_to) {
    context.reply(
      "Missing required parameters. Please provide amount, token_from, and token_to."
    );
    return;
  }

  let swapUrl = `${baseUrl}/?transaction_type=swap&token_from=${token_from}&token_to=${token_to}&amount=${amount}`;
  return {
    code: 200,
    message: swapUrl,
  };
}
