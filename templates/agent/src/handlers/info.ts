import { ensUrl } from "../index.js";
import { XMTPContext, getUserInfo, isOnXMTP } from "@xmtp/message-kit";

import type { skillAction } from "@xmtp/message-kit";

export const registerSkill: skillAction[] = [
  {
    skill: "/info [domain]",
    handler: handleInfo,
    description:
      "Get detailed information about an ENS domain including owner, expiry date, and resolver.",
    examples: ["/info nick.eth"],
    params: {
      domain: {
        type: "string",
      },
    },
  },
];

export async function handleInfo(context: XMTPContext) {
  const {
    message: {
      sender,
      content: {
        params: { domain },
      },
    },
  } = context;

  const data = await getUserInfo(domain);
  if (!data?.ensDomain) {
    return {
      code: 404,
      message: "Domain not found.",
    };
  }

  const formattedData = {
    Address: data?.address,
    "Avatar URL": data?.ensInfo?.avatar,
    Description: data?.ensInfo?.description,
    ENS: data?.ensDomain,
    "Primary ENS": data?.ensInfo?.ens_primary,
    GitHub: data?.ensInfo?.github,
    Resolver: data?.ensInfo?.resolverAddress,
    Twitter: data?.ensInfo?.twitter,
    URL: `${ensUrl}${domain}`,
  };

  let message = "Domain information:\n\n";
  for (const [key, value] of Object.entries(formattedData)) {
    if (value) {
      message += `${key}: ${value}\n`;
    }
  }
  message += `\n\nWould you like to tip the domain owner for getting there first 🤣?`;
  message = message.trim();
  if (await isOnXMTP(context.client, context.v2client, sender?.address)) {
    await context.send(
      `Ah, this domains is in XMTP, you can message it directly: https://converse.xyz/dm/${domain}`,
    );
  }
  return { code: 200, message };
}
