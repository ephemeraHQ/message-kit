import { Client } from "@xmtp/xmtp-js";
import { isAddress } from "viem";

export const converseEndpointURL =
  "https://converse-website-git-endpoit-ephemerahq.vercel.app";
export type ChatHistoryEntry = { role: string; content: string };
export type ChatHistories = Record<string, ChatHistoryEntry[]>;
export type ensDomain = Record<string, string | undefined>;
export type converseUsername = Record<string, string | undefined>;

export type InfoCache = {
  [key: string]: { info: EnsData };
};

export interface EnsData {
  address?: string;
  avatar?: string;
  avatar_small?: string;
  converse?: string;
  avatar_url?: string;
  contentHash?: string;
  description?: string;
  ens?: string;
  ens_primary?: string;
  github?: string;
  resolverAddress?: string;
  twitter?: string;
  url?: string;
  wallets?: {
    eth?: string;
  };
}

let infoCache: InfoCache = {};

export const clearInfoCache = () => {
  infoCache = {};
};
export const getUserInfo = async (
  key: string,
): Promise<{ domain: string; info: EnsData } | null> => {
  let ensDomain: string | undefined;
  let converseUsername: string | undefined;
  let address: string | undefined;
  if (isAddress(key)) {
    address = key;
  } else if (key.includes(".eth")) {
    ensDomain = key;
  } else if (key == "@alix") {
    address = "0x0000000000000000000000000000000000000000";
    converseUsername = "alix";
  } else if (key == "@bo") {
    address = "0x0000000000000000000000000000000000000000";
    converseUsername = "bo";
  } else if (key.startsWith("@")) {
    converseUsername = key;
  }
  if (key.includes(".eth")) {
    const response = await fetch(`https://ensdata.net/${key}`);
    const data: EnsData = (await response.json()) as EnsData;
    ensDomain = data?.ens;
  }
  if (!converseUsername) {
    const response = await fetch(`${converseEndpointURL}/profile/${address}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ address: address }),
    });
    const data = (await response.json()) as { name: string };
    converseUsername = data?.name;
    converseUsername = converseUsername?.replace(".converse.xyz", "");
  }
  key = address || ensDomain || converseUsername;
  console.log("Getting info cache", key);
  try {
    if (infoCache[key] && Object.keys(infoCache[key]).length > 0) {
      const data = {
        domain: key,
        info: infoCache[key].info,
        infoCache: infoCache,
      };
      console.log(data);
      return data;
    }
    if (key.includes(".eth")) {
      console.log("Fetching from ensdata.net", key);
      const response = await fetch(`https://ensdata.net/${key}`);
      const fetchedData: EnsData = (await response.json()) as EnsData;
      if (!fetchedData?.address && !fetchedData?.ens) {
        return null;
      }
      // Assuming the data contains both domain and address
      const domain = fetchedData?.ens;
      const address = fetchedData?.address;

      // Store data in cache by both domain and address
      if (domain) infoCache[domain as string] = { info: fetchedData };
      if (address) infoCache[address as string] = { info: fetchedData };
      const data = {
        domain: domain || "",
        info: fetchedData,
        infoCache: infoCache,
      };
      return data;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

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
export const isOnXMTP = async (
  client: Client,
  domain: string | undefined,
  address: string | undefined,
) => {
  if (domain == "fabri.eth") return false;
  if (address) return (await client.canMessage([address])).length > 0;
};
