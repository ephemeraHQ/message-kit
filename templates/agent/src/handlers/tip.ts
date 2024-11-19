import { txpayUrl } from "../index.js";
import { XMTPContext, getUserInfo } from "@xmtp/message-kit";

import type { skillAction } from "@xmtp/message-kit";

export const registerSkill: skillAction[] = [
  {
    skill: "/tip [address]",
    description: "Show a URL for tipping a domain owner.",
    handler: handleTip,
    examples: ["/tip 0x1234567890123456789012345678901234567890"],
    params: {
      address: {
        type: "string",
      },
    },
  },
];
export async function handleTip(context: XMTPContext) {
  const {
    message: {
      content: {
        params: { address },
      },
    },
  } = context;

  if (!address) {
    return {
      code: 400,
      message: "Please provide an address to tip.",
    };
  }
  const data = await getUserInfo(address);

  let sendUrl = `${txpayUrl}/?&amount=1&token=USDC&receiver=${address}`;

  return {
    code: 200,
    message: sendUrl,
  };
}
