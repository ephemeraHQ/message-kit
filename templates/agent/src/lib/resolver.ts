import type { EnsData } from "./types.js";
import { endpointURL } from "./types.js";
import { Client } from "@xmtp/xmtp-js";

export type InfoCache = {
  [key: string]: { info: EnsData };
};
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

export const getInfoCache = async (
  key: string, // This can be either domain or address
  infoCache: InfoCache,
): Promise<{ domain: string; info: EnsData; infoCache: InfoCache }> => {
  if (infoCache[key]) {
    let data = {
      domain: key,
      info: infoCache[key].info,
      infoCache: infoCache,
    };
    return data;
  }
  try {
    const response = await fetch(`https://ensdata.net/${key}`);
    const data: EnsData = (await response.json()) as EnsData;

    // Assuming the data contains both domain and address
    const domain = data?.ens;
    const address = data?.address;

    // Store data in cache by both domain and address
    if (domain) infoCache[domain as string] = { info: data };
    if (address) infoCache[address as string] = { info: data };

    return { info: data, infoCache: infoCache, domain: domain as string };
  } catch (error) {
    console.error(error);
    return { info: {}, infoCache: infoCache, domain: "" };
  }
};
export const generateCoolAlternatives = (domain: string) => {
  const suffixes = ["lfg", "cool", "degen", "moon", "base", "gm"];
  const alternatives = suffixes.map((suffix) => {
    const randomPosition = Math.random() < 0.5;
    return randomPosition ? `${suffix}${domain}.eth` : `${domain}${suffix}.eth`;
  });
  return alternatives.join(",");
};
export const isOnXMTP = async (
  client: Client,
  domain: string | undefined,
  address: string | undefined,
) => {
  if (domain == "fabri.eth") return false;
  if (address) return (await client.canMessage([address])).length > 0;
};
