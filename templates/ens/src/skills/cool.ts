import { Context } from "@xmtp/message-kit";

import type { Skill } from "@xmtp/message-kit";

export const cool: Skill[] = [
  {
    skill: "cool",
    examples: ["/cool vitalik.eth"],
    handler: handler,
    description: "Get cool alternatives for a .eth domain.",
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
  //What about these cool alternatives?\
  return {
    code: 200,
    message: `${generateCoolAlternatives(domain)}`,
  };
}

export const generateCoolAlternatives = (domain: string) => {
  const suffixes = ["lfg", "cool", "degen", "moon", "base", "gm"];
  const alternatives = [];
  for (let i = 0; i < 5; i++) {
    const randomPosition = Math.random() < 0.5;
    const baseDomain = domain.replace(/\.eth$/, ""); // Remove any existing .eth suffix
    alternatives.push(
      randomPosition
        ? `${suffixes[i]}${baseDomain}.eth`
        : `${baseDomain}${suffixes[i]}.eth`,
    );
  }

  const cool_alternativesFormat = alternatives
    .map(
      (alternative: string, index: number) => `${index + 1}. ${alternative} ✨`,
    )
    .join("\n");
  return cool_alternativesFormat;
};
