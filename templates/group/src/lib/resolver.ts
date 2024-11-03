import { Client } from "@xmtp/xmtp-js";
import { isAddress } from "viem";

export const converseEndpointURL =
  "https://converse-website-git-endpoit-ephemerahq.vercel.app";
//export const converseEndpointURL = "http://localhost:3000";

export type InfoCache = Map<string, UserInfo>;
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
  preferredName?: string | undefined;
  ensInfo?: EnsData | undefined;
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

let infoCache: InfoCache = new Map();

export const clearInfoCache = () => {
  infoCache.clear();
};
export const getUserInfo = async (
  key: string,
  clientAddress?: string,
): Promise<UserInfo | null> => {
  let data: UserInfo = infoCache.get(key) || {
    ensDomain: undefined,
    address: undefined,
    converseUsername: undefined,
    ensInfo: undefined,
  };
  if (isAddress(clientAddress || "")) {
    data.address = clientAddress;
  } else if (isAddress(key || "")) {
    data.address = key;
  } else if (key?.includes(".eth")) {
    data.ensDomain = key;
  } else if (key == "@user" || key == "@me" || key == "@bot") {
    data.address = clientAddress;
    data.ensDomain = key.replace("@", "") + ".eth";
    data.converseUsername = key.replace("@", "");
  } else if (key == "@alix") {
    data.address = "0x3a044b218BaE80E5b9E16609443A192129A67BeA";
    data.converseUsername = "alix";
  } else if (key == "@bo") {
    data.address = "0xbc3246461ab5e1682baE48fa95172CDf0689201a";
    data.converseUsername = "bo";
  } else {
    data.converseUsername = key;
  }

  let keyToUse = data.address || data.ensDomain || data.converseUsername;
  let cacheData = keyToUse && infoCache.get(keyToUse);
  console.log("Getting user info", { cacheData, keyToUse, data });
  if (cacheData) return cacheData;

  if (keyToUse?.includes(".eth")) {
    const response = await fetch(`https://ensdata.net/${keyToUse}`);
    const ensData: EnsData = (await response.json()) as EnsData;
    //console.log("Ens data", ensData);
    if (ensData) {
      data.ensInfo = ensData;
      data.ensDomain = ensData?.ens;
      data.address = ensData?.address;
    }
  } else if (keyToUse) {
    keyToUse = keyToUse.replace("@", "");
    const response = await fetch(`${converseEndpointURL}/profile/${keyToUse}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        peer: keyToUse,
      }),
    });
    const converseData = (await response.json()) as ConverseProfile;
    if (process.env.MSG_LOG)
      console.log("Converse data", keyToUse, converseData);
    data.converseUsername =
      converseData?.formattedName || converseData?.name || undefined;
    data.address = converseData?.address || undefined;
    data.avatar = converseData?.avatar || undefined;
  }
  if (data.address) infoCache.set(data.address, data);
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

export const PROMPT_USER_CONTENT = (userInfo: UserInfo) => {
  let { address, ensDomain, converseUsername, preferredName } = userInfo;
  let prompt = `User context: 
- Start by fetch their domain from or Convese username
- Call the user by their name or domain, in case they have one
- Ask for a name (if they don't have one) so you can suggest domains.
- Users address is: ${address}`;
  if (preferredName) prompt += `\n- Users name is: ${preferredName}`;
  if (ensDomain) prompt += `\n- User ENS domain is: ${ensDomain}`;
  if (converseUsername)
    prompt += `\n- Converse username is: ${converseUsername}`;
  return prompt;
};
