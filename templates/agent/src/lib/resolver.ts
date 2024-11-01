import type { EnsData } from "./types.js";
import { endpointURL } from "./types.js";
import { Client } from "@xmtp/xmtp-js";
import { InfoCache } from "./types.js";

let infoCache: InfoCache = {};
export async function getUserInfo(
  address: string,
  ensDomain: string | undefined,
  converseUsername: string | undefined,
) {
  if (!ensDomain) {
    const response = await fetch(`https://ensdata.net/${address}`);
    const data: EnsData = (await response.json()) as EnsData;
    ensDomain = data?.ens;
  }
  if (!converseUsername) {
    const response = await fetch(`${endpointURL}/profile/${address}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ address: address }),
    });
    const data = (await response.json()) as { name: string };
    converseUsername = data?.name;
    converseUsername = converseUsername.replace(".converse.xyz", "");
  }
  console.log("User info fetched for", {
    address,
    converseUsername,
    ensDomain,
  });
  return { converseUsername: converseUsername, ensDomain: ensDomain };
}
export const clearInfoCache = () => {
  infoCache = {};
};
export const getInfoCache = async (
  key: string,
): Promise<{ domain: string; info: EnsData } | null> => {
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
