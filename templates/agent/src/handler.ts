import { HandlerContext, SkillResponse } from "@xmtp/message-kit";
import { getUserInfo, clearInfoCache, isOnXMTP } from "@xmtp/message-kit";
import { clearMemory } from "@xmtp/message-kit";

export const frameUrl = "https://ens.steer.fun/";
export const ensUrl = "https://app.ens.domains/";
export const txpayUrl = "https://txpay.vercel.app";

export async function handleEns(
  context: HandlerContext,
): Promise<SkillResponse | undefined> {
  const {
    message: {
      sender,
      content: { skill, params },
    },
  } = context;

  if (skill == "reset") {
    clearMemory();
    return { code: 200, message: "Conversation reset." };
  } else if (skill == "renew") {
    // Destructure and validate parameters for the ens
    const { domain } = params;
    // Check if the user holds the domain
    if (!domain) {
      return {
        code: 400,
        message: "Missing required parameters. Please provide domain.",
      };
    }

    const data = await getUserInfo(domain);

    if (!data?.address || data?.address !== sender?.address) {
      return {
        code: 403,
        message:
          "Looks like this domain is not registered to you. Only the owner can renew it.",
      };
    }

    // Generate URL for the ens
    let url_ens = frameUrl + "frames/manage?name=" + domain;
    return { code: 200, message: `${url_ens}` };
  } else if (skill == "register") {
    // Destructure and validate parameters for the ens
    const { domain } = params;

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
  } else if (skill == "info") {
    const { domain } = params;

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
  } else if (skill == "check") {
    const { domain } = params;

    if (!domain) {
      return {
        code: 400,
        message: "Please provide a domain name to check.",
      };
    }

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
  } else if (skill == "tip") {
    const { address } = params;
    if (!address) {
      return {
        code: 400,
        message: "Please provide an address to tip.",
      };
    }
    const data = await getUserInfo(address);

    let sendUrl = `${txpayUrl}/?&amount=1&token=USDC&receiver=${address}`;

    return {
      code: 200,
      message: sendUrl,
    };
  } else if (skill == "cool") {
    const { domain } = params;
    //What about these cool alternatives?\
    return {
      code: 200,
      message: `${generateCoolAlternatives(domain)}`,
    };
  } else {
    return { code: 400, message: "Skill not found." };
  }
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

export async function clear() {
  clearMemory();
  clearInfoCache();
}
