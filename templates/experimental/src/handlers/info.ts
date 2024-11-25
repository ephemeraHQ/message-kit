import { ensUrl } from "../index.js";
import { XMTPContext, getUserInfo, isOnXMTP } from "@xmtp/message-kit";

import type { Skill } from "@xmtp/message-kit";

export const registerSkill: Skill[] = [
  {
    skill: "/info [domain]",
    handler: handler,
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

export async function handler(context: XMTPContext) {
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
  console.log(data);
  let message = `Domain information:\n\n`;
  message += `URL: https://app.ens.domains/${data?.ensDomain}\n`;
  if (data?.address) message += `Address: ${data?.address}\n`;
  if (data?.ensInfo?.avatar) message += `Avatar: ${data?.ensInfo?.avatar}\n`;
  if (data?.ensInfo?.description)
    message += `Description: ${data?.ensInfo?.description}\n`;
  if (data?.ensInfo?.ens_primary)
    message += `Primary ENS: ${data?.ensInfo?.ens_primary}\n`;
  if (data?.ensInfo?.github) message += `GitHub: ${data?.ensInfo?.github}\n`;
  if (data?.ensInfo?.twitter) message += `Twitter: ${data?.ensInfo?.twitter}\n`;
  message += `\n\nWould you like to tip the domain owner for getting there first 🤣?`;
  message = message.trim();

  if (await isOnXMTP(context.client, context.v2client, sender?.address)) {
    await context.send(
      `Ah, this domains is in XMTP, you can message it directly`,
    );
    await context.sendConverseDmFrame(domain);
  }

  return { code: 200, message };
}
