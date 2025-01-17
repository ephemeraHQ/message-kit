import { Context, Skill } from "@xmtp/message-kit";
import { getUserInfo } from "@xmtp/agent-starter";

const ensUrl = "https://app.ens.domains/";

// [!region define]
export const checkDomain: Skill[] = [
  {
    skill: "check",
    handler: handler,
    examples: ["/check vitalik.eth", "/check fabri.base.eth"],
    description: "Check if a domain is available.",
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
// [!endregion handle]
