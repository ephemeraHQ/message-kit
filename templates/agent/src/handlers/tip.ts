import { XMTPContext } from "@xmtp/message-kit";

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
  await context.requestPayment(1, "USDC", address);
}
