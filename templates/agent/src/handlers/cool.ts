import { XMTPContext } from "@xmtp/message-kit";

import type { skillAction } from "@xmtp/message-kit";

export const registerSkill: skillAction[] = [
  {
    skill: "/cool [domain]",
    examples: ["/cool vitalik.eth"],
    handler: handleCool,
    description: "Get cool alternatives for a .eth domain.",
    params: {
      domain: {
        type: "string",
      },
    },
  },
];
export async function handleCool(context: XMTPContext) {
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
