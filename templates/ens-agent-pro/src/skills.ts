import { DynamicStructuredTool } from "langchain/tools";
import { getUserInfo } from "@xmtp/message-kit";
import { clearMemory } from "@xmtp/message-kit";
import { isAddress } from "viem";
import { z } from "zod";

const frameUrl = "https://ens.steer.fun/";
const ensUrl = "https://app.ens.domains/";
const txpayUrl = "https://txpay.vercel.app";
const converseUrl = "https://converse.xyz/profile/";

// Add interface for Converse API response
interface ConverseProfile {
  address: string;
  avatar?: string;
  formattedName?: string;
  name?: string;
  onXmtp: boolean;
}

// Add function to check XMTP status
async function checkXMTPStatus(address: string): Promise<boolean> {
  try {
    const response = await fetch(converseUrl + address, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      console.error(`Failed to check XMTP status: ${response.status}`);
      return false;
    }

    const data = (await response.json()) as ConverseProfile;
    return data.onXmtp;
  } catch (error) {
    console.error("Error checking XMTP status:", error);
    return false;
  }
}

const generateCoolAlternatives = (domain: string) => {
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

  return alternatives
    .map(
      (alternative: string, index: number) => `${index + 1}. ${alternative} ✨`,
    )
    .join("\n");
};

// Export tools array with all tools
export const tools = [
  new DynamicStructuredTool({
    name: "reset_ens_conversation",
    description: "Reset the ENS conversation and clear memory",
    schema: z.object({}),
    func: async () => {
      clearMemory();
      return "Conversation reset successfully.";
    },
  }),

  new DynamicStructuredTool({
    name: "renew_ens_domain",
    description:
      "Generate renewal URL for an ENS domain. Only works if sender owns the domain",
    schema: z.object({
      domain: z.string().describe("The ENS domain to renew"),
    }),
    func: async ({ domain }) => {
      const data = await getUserInfo(domain);
      if (!data?.address) {
        return "Domain not found or not registered.";
      }
      return `${frameUrl}frames/manage?name=${domain}`;
    },
  }),

  new DynamicStructuredTool({
    name: "register_ens_domain",
    description: "Get URL to register a new ENS domain",
    schema: z.object({
      domain: z.string().describe("The ENS domain to register"),
    }),
    func: async ({ domain }) => {
      if (!domain) return "Please provide a domain name";
      return `${ensUrl}${domain}`;
    },
  }),

  new DynamicStructuredTool({
    name: "get_ens_info",
    description:
      "Get detailed information about an ENS domain including owner, avatar, description, etc",
    schema: z.object({
      domain: z.string().describe("The ENS domain to get information about"),
    }),
    func: async ({ domain }) => {
      const data = await getUserInfo(domain);
      if (!data?.ensDomain) {
        return "Domain not found.";
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
      message +=
        "\nWould you like to tip the domain owner for getting there first? 🤣";

      // Check XMTP status if we have an address
      if (data.address) {
        const isOnXMTP = await checkXMTPStatus(data.address);
        if (isOnXMTP) {
          message += `\n\nAh, this domain is on XMTP! You can message it directly: https://converse.xyz/dm/${domain}`;
        }
      }

      return message;
    },
  }),

  new DynamicStructuredTool({
    name: "check_ens_availability",
    description: "Check if an ENS domain is available for registration",
    schema: z.object({
      domain: z
        .string()
        .transform((str) => str.replace(/^["'](.+)["']$/, "$1")) // Remove quotes if present
        .transform((str) => str.toLowerCase())
        .describe("The ENS domain to check availability for"),
    }),
    func: async ({ domain }) => {
      if (!domain) return "Please provide a domain name to check.";

      if (domain.includes(".") && !domain.endsWith(".eth")) {
        return "Invalid ENS domain. Only .eth domains are supported.";
      }

      if (!domain.includes(".")) {
        domain = `${domain}.eth`;
      }

      const data = await getUserInfo(domain);
      if (!data?.address) {
        return `Looks like ${domain} is available! Here you can register it: ${ensUrl}${domain} or would you like to see some cool alternatives?`;
      } else {
        const alternatives = generateCoolAlternatives(domain);
        return `Looks like ${domain} is already registered!\n\nHere are some cool alternatives:\n${alternatives}`;
      }
    },
  }),

  new DynamicStructuredTool({
    name: "get_ens_alternatives",
    description: "Generate cool alternative names for an ENS domain",
    schema: z.object({
      domain: z
        .string()
        .describe("The ENS domain to generate alternatives for"),
    }),
    func: async ({ domain }) => {
      if (!domain) return "Please provide a domain name.";
      return `What about these cool alternatives?\n\n${generateCoolAlternatives(domain)}`;
    },
  }),

  new DynamicStructuredTool({
    name: "get_ens_tip_url",
    description:
      "Generate a URL to tip an ENS domain owner in USDC. Works with both ENS domains and Ethereum addresses.",
    schema: z.object({
      addressOrDomain: z
        .string()
        .describe("The ENS domain or Ethereum address to tip"),
      amount: z
        .number()
        .optional()
        .default(1)
        .describe("The amount of USDC to tip"),
    }),
    func: async ({ addressOrDomain, amount }) => {
      if (!addressOrDomain) {
        return "Please provide an address or ENS domain to tip.";
      }

      let address: string | undefined;

      if (isAddress(addressOrDomain)) {
        address = addressOrDomain;
      } else {
        const data = await getUserInfo(addressOrDomain);
        address = data?.address;
      }

      if (!address) {
        return "Could not resolve address for tipping. Please provide a valid ENS domain or Ethereum address.";
      }

      let sendUrl = `${txpayUrl}/?&amount=${amount}&token=USDC&receiver=${address}`;
      return sendUrl;
    },
  }),
];
