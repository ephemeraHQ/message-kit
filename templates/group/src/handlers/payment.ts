import { getUserInfo, XMTPContext } from "@xmtp/message-kit";
import type { skillAction } from "@xmtp/message-kit";
export const registerSkill: skillAction[] = [
  {
    skill: "/pay [amount] [token] [username]",
    examples: ["/pay 10 usdc vitalik.eth", "/pay 1 @alix"],
    description:
      "Send a specified amount of a cryptocurrency to a destination address.",
    handler: handlePay,
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

export async function handlePay(context: XMTPContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const txpayUrl = "https://txpay.vercel.app";

  const { amount: amountSend, token: tokenSend, username } = params;
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

  let sendUrl = `${txpayUrl}/?&amount=${amountSend}&token=${tokenSend}&receiver=${senderInfo.address}`;
  await context.send(`${sendUrl}`);
}
