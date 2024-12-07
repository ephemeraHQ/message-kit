import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";

export const registerSkill: Skill[] = [
  {
    skill: "/pay [amount] [token] [username]",
    examples: ["/pay 10 vitalik.eth"],
    description:
      "Send a specified amount of a cryptocurrency to a destination address.",
    handler: handler,
    params: {
      amount: {
        default: 10,
        type: "number",
      },
      token: {
        default: "usdc",
        type: "string",
        values: ["eth", "dai", "usdc", "degen"], // Accepted tokens
      },
      username: {
        default: "",
        type: "username",
      },
    },
  },
];

export async function handler(context: XMTPContext) {
  const { params } = context.message.content;

  const { amount: amountSend, token: tokenSend, username } = params;

  await context.requestPayment(amountSend, tokenSend, username);
}
