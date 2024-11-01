import { Client } from "@xmtp/xmtp-js";
import { isAddress } from "viem";

export const converseEndpointURL =
  "https://converse-website-git-endpoit-ephemerahq.vercel.app";

export type InfoCache = {
  [key: string]: { info: EnsData };
};
export type UserInfo = {
  ensDomain: string | undefined;
  address: string | undefined;
  converseUsername: string | undefined;
  info: EnsData;
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
export const getUserInfo = async (key: string): Promise<UserInfo | null> => {
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
  let keyToUse = address || ensDomain || converseUsername;
  console.log("Getting info cache", keyToUse);
  if (
    infoCache[keyToUse as string] &&
    Object.keys(infoCache[keyToUse as string]).length > 0
  ) {
    const data = {
      ensDomain: keyToUse,
      address: address,
      converseUsername: converseUsername,
      info: infoCache[keyToUse as string].info,
      infoCache: infoCache,
    };
    console.log(data);
    return data;
  }

  if (keyToUse?.includes(".eth")) {
    const response = await fetch(`https://ensdata.net/${keyToUse}`);
    const data: EnsData = (await response.json()) as EnsData;
    ensDomain = data?.ens;
    address = data?.address;
    if (ensDomain) infoCache[ensDomain as string] = { info: data };
    if (address) infoCache[address as string] = { info: data };
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
  const data: UserInfo = {
    ensDomain: ensDomain || "",
    address: address || "",
    converseUsername: converseUsername || "",
    info: infoCache[keyToUse as string]?.info || {},
  };
  console.log(data);
  return data;
};
export const isOnXMTP = async (
  client: Client,
  domain: string | undefined,
  address: string | undefined,
) => {
  if (domain == "fabri.eth") return false;
  if (address) return (await client.canMessage([address])).length > 0;
};
