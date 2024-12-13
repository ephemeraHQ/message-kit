import { Context } from "@xmtp/message-kit";

const ensUrl = "https://app.ens.domains/";
import type { Skill } from "@xmtp/message-kit";

export const register: Skill[] = [
  {
    skill: "register",
    handler: handler,
    description:
      "Register a new ENS domain. Returns a URL to complete the registration process.",
    examples: ["/register vitalik.eth"],
    params: {
      domain: {
        type: "string",
      },
    },
  },
];

export async function handler(context: Context) {
  const {
    message: {
      content: {
        params: { domain },
      },
    },
  } = context;

  if (!domain) {
    return {
      code: 400,
      message: "Missing required parameters. Please provide domain.",
    };
  }
  // Generate URL for the ens
  let url_ens = ensUrl + domain;
  return { code: 200, message: `${url_ens}` };
}
