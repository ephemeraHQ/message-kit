import { Client } from "@xmtp/xmtp-js";
import { isAddress } from "viem";

export const converseEndpointURL =
  "https://converse-website-git-endpoit-ephemerahq.vercel.app";

export type InfoCache = {
  [key: string]: { info: EnsData };
};
export type ConverseProfile = {
  address: string | null;
  onXmtp: boolean;
  avatar: string | null;
  formattedName: string | null;
  name: string | null;
};
export type UserInfo = {
  ensDomain?: string | undefined;
  address?: string | undefined;
  converseUsername?: string | undefined;
  info?: EnsData | undefined;
  avatar?: string | undefined;
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
  bot?: string,
): Promise<UserInfo | null> => {
  let data: UserInfo = {
    ensDomain: undefined,
    address: undefined,
    converseUsername: undefined,
    info: undefined,
  };
  if (isAddress(key)) {
    data.address = key;
  } else if (key.includes(".eth")) {
    data.ensDomain = key;
  } else if (key == "@user" || key == "@me" || key == "@bot") {
    data.address = bot;
    data.ensDomain = key.replace("@", "") + ".eth";
    data.converseUsername = key.replace("@", "");
  } else if (key == "@alix") {
    data.address = "0x3a044b218BaE80E5b9E16609443A192129A67BeA";
    data.converseUsername = "alix";
  } else if (key == "@bo") {
    data.address = "0xbc3246461ab5e1682baE48fa95172CDf0689201a";
    data.converseUsername = "bo";
  } else if (key?.startsWith("@")) {
    data.converseUsername = key.replace("@", "");
  } else {
    return null;
  }
  let keyToUse = data.address || data.ensDomain || data.converseUsername;
  if (
    infoCache[keyToUse as string] &&
    Object.keys(infoCache[keyToUse as string]).length > 0
  ) {
    data = {
      ensDomain: keyToUse,
      address: data.address,
      converseUsername: data.converseUsername,
      info: infoCache[keyToUse as string].info,
    };
    console.log("Getting info cache", data);
    return data;
  }

  if (keyToUse?.includes(".eth")) {
    const response = await fetch(`https://ensdata.net/${keyToUse}`);
    const ensData: EnsData = (await response.json()) as EnsData;
    data.ensDomain = ensData?.ens;
    data.address = ensData?.address;
    if (data.ensDomain) infoCache[data.ensDomain as string] = { info: data };
    if (data.address) infoCache[data.address as string] = { info: data };
  } else if (data.converseUsername) {
    const response = await fetch(
      `${converseEndpointURL}/profile/${data.converseUsername}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ address: data.address }),
      },
    );
    const converseData = (await response.json()) as ConverseProfile;
    console.log("Converse data", converseData);
    data.converseUsername =
      converseData?.formattedName || converseData?.name || undefined;
    data.address = converseData?.address || undefined;
    data.avatar = converseData?.avatar || undefined;
  }
  data = {
    ensDomain: data.ensDomain || "",
    address: data.address || "",
    converseUsername: data.converseUsername || "",
    info: infoCache[keyToUse as string]?.info || {},
  };
  console.log("User info", data);
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
