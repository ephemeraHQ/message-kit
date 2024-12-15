import { Context, getUserInfo, Skill } from "@xmtp/message-kit";

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
        params: { amount, token, username, address },
      },
    },
  } = context;
  let receiverAddress = address;
  if (username) {
    receiverAddress = (await getUserInfo(username))?.address;
  }
  if (address) {
    //Prioritize address over username
    receiverAddress = address;
  }
  if (skill === "tip") {
    let tipAmount = 1;
    await context.framekit.requestPayment(receiverAddress, tipAmount);
  } else if (skill === "pay") {
    await context.framekit.requestPayment(receiverAddress, amount, token);
  }
}
