import { baselinks, Context } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";

export const registerSkill: Skill[] = [
  {
    skill: "pay",
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

export async function handler(context: Context) {
  const { params } = context.message.content;

  const { amount: amountSend, token: tokenSend, username } = params;

  const url = await baselinks.requestPayment(username?.address, amountSend);
  await context.dm(url);
}
