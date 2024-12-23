import { Context, baselinks, Skill } from "@xmtp/message-kit";

export const pay: Skill[] = [
  {
    skill: "pay",
    examples: [
      "/pay 10 vitalik.eth",
      "/pay 1 usdc to 0xC60E6Bb79322392761BFe3081E302aEB79B30B03",
    ],
    description:
      "Send a specified amount of a cryptocurrency to a destination address. \nWhen tipping, you can asume its 1 usdc.",
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
  {
    skill: "tip",
    examples: ["/tip vitalik.eth"],
    description: "Send 1 usdc.",
    handler: handler,
    params: {
      username: {
        default: "",
        type: "username",
      },
    },
  },
];
export async function handler(context: Context) {
  const {
    message: {
      content: {
        skill,
        params: { amount, username },
      },
    },
  } = context;
  let receiverAddress = username?.address;
  if (skill === "tip") {
    let tipAmount = 1;
    const url = baselinks.paymentLink(receiverAddress, tipAmount);
    await context.send({ message: url, originalMessage: context.message });
  } else if (skill === "pay") {
    const url = baselinks.paymentLink(receiverAddress, amount);
    await context.send({ message: url, originalMessage: context.message });
  }
}
