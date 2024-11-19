import { ensUrl } from "../index.js";
import { XMTPContext, getUserInfo } from "@xmtp/message-kit";

import type { skillAction } from "@xmtp/message-kit";

export const registerSkill: skillAction[] = [
  {
    skill: "/check [domain]",
    handler: handleCheck,
    examples: ["/check vitalik.eth", "/check fabri.base.eth"],
    description: "Check if a domain is available.",
    params: {
      domain: {
        type: "string",
      },
    },
  },
];
export async function handleCheck(context: XMTPContext) {
  const {
    message: {
      content: {
        params: { domain },
      },
    },
  } = context;

  const data = await getUserInfo(domain);
  if (!data?.address) {
    let message = `Looks like ${domain} is available! Here you can register it: ${ensUrl}${domain} or would you like to see some cool alternatives?`;
    return {
      code: 200,
      message,
    };
  } else {
    let message = `Looks like ${domain} is already registered!`;
    await context.executeSkill("/cool " + domain);
    return {
      code: 404,
      message,
    };
  }
}
