import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";

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
      address: {
        default: "",
        type: "address",
      },
    },
  },
];
export async function handler(context: XMTPContext) {
  const {
    message: {
      content: {
        params: { amount, token, username, address },
      },
    },
  } = context;
  let receiverAddress = address;
  if (username) {
    receiverAddress = (await context.getUserInfo(username))?.address;
  }
  if (address) {
    //Prioritize address over username
    receiverAddress = address;
  }

  await context.requestPayment(amount, token, receiverAddress);
}
