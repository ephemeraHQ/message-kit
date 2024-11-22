import { ensUrl } from "../index.js";
import { XMTPContext } from "@xmtp/message-kit";

import type { Skill } from "@xmtp/message-kit";

export const registerSkill: Skill[] = [
  {
    skill: "/register [domain]",
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

export async function handler(context: XMTPContext) {
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
  context.send(`${url_ens}`);
  return { code: 200, message: `${url_ens}` };
}
