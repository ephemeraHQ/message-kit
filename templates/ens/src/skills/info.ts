import { Context } from "@xmtp/message-kit";

import type { Skill } from "@xmtp/message-kit";

// [!region define]
export const info: Skill[] = [
  {
    skill: "info",
    handler: handler,
    description:
      "Get detailed information about an ENS domain including owner, expiry date, and resolver.",
    examples: [
      "/info humanagent.eth",
      "/info fabri.base.eth",
      "/info @fabri",
      "/info fabri.converse.xyz",
      "/info vitalik.eth",
    ],
    params: {
      domain: {
        type: "string",
      },
    },
  },
];
// [!endregion define]

// [!region handle]
export async function handler(context: Context) {
  const {
    message: {
      sender,
      content: {
        params: { domain },
      },
    },
  } = context;

  const data = await context.getUserInfo(domain);
  if (!data?.address) {
    return {
      code: 404,
      message: "Domain not found.",
    };
  }
  let message = `Information:\n\n`;
  if (data?.ensDomain)
    message += `URL: https://app.ens.domains/${data?.ensDomain}\n`;
  if (data?.converseUsername)
    message += `Converse: https://converse.xyz/dm/${data?.converseUsername}\n`;
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
  return { code: 200, message };
}
// [!endregion handle]
