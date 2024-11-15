import { isAddress } from "viem";
import { V2Client, V3Client } from "../index";
import { HandlerContext } from "../lib/handlerContext";

export const converseEndpointURL = "https://converse.xyz/profile/";

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
  preferredName: string | undefined;
  converseUsername?: string | undefined;
  ensInfo?: EnsData | undefined;
  avatar?: string | undefined;
  converseEndpoint?: string | undefined;
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

export const clearInfoCache = (address?: string) => {
  if (address) {
    infoCache.delete(address);
  } else {
    infoCache.clear();
  }
};
export const getUserInfo = async (
  key: string,
  clientAddress?: string,
  context?: HandlerContext,
): Promise<UserInfo | null> => {
  try {
    let data: UserInfo = infoCache.get(key) || {
      ensDomain: undefined,
      address: undefined,
      converseUsername: undefined,
      ensInfo: undefined,
      avatar: undefined,
      converseEndpoint: undefined,
      preferredName: undefined,
    };

    // Determine user information based on provided key
    if (isAddress(clientAddress || "")) {
      data.address = clientAddress;
    } else if (isAddress(key || "")) {
      data.address = key;
    } else if (key.includes(".eth")) {
      data.ensDomain = key;
    } else if (["@user", "@me", "@bot"].includes(key)) {
      data.address = clientAddress;
      data.ensDomain = key.replace("@", "") + ".eth";
      data.converseUsername = key.replace("@", "");
    } else if (key === "@alix") {
      data.address = "0x3a044b218BaE80E5b9E16609443A192129A67BeA";
      data.converseUsername = "alix";
    } else if (key === "@bo") {
      data.address = "0xbc3246461ab5e1682baE48fa95172CDf0689201a";
      data.converseUsername = "bo";
    } else {
      data.converseUsername = key;
    }

    data.preferredName = data.ensDomain || data.converseUsername || "Friend";
    const keyToUse = data.address || data.ensDomain || data.converseUsername;

    if (!keyToUse) {
      throw new Error(
        "Unable to determine a valid key for fetching user info.",
      );
    }

    // Check cache for existing data
    const cacheData = infoCache.get(keyToUse);
    if (cacheData) {
      return cacheData;
    }

    // Notify user about the fetching process
    if (context) {
      await context.send(
        "Hey there! Give me a sec while I fetch info about you first...",
      );
    }

    // Fetch data based on ENS domain or Converse username
    if (keyToUse.includes(".eth")) {
      // Fetch ENS data
      try {
        const response = await fetch(`https://ensdata.net/${keyToUse}`);
        console.log(response);
        if (!response.ok) {
          console.error(
            `ENS data request failed with status or unable to resolve ${keyToUse}`,
          );
        } else {
          const ensData = (await response.json()) as EnsData;
          if (ensData) {
            data.ensInfo = ensData;
            data.ensDomain = ensData.ens || data.ensDomain;
            data.address = ensData.address || data.address;
            data.avatar = ensData.avatar_url || data.avatar;
          }
        }
      } catch (error) {
        console.error("Failed to fetch ENS data:", error);
      }
    } else {
      // Fetch Converse profile data
      try {
        const username = keyToUse.replace("@", "");
        const converseEndpoint = `${converseEndpointURL}${username}`;
        const response = await fetchWithTimeout(
          converseEndpoint,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ peer: username }),
          },
          5000,
        );
        if (!response.ok) {
          console.error(
            `Converse profile request failed with status ${response.status}`,
          );
        }
        const converseData = (await response.json()) as ConverseProfile;
        if (converseData) {
          data.converseUsername =
            converseData.formattedName ||
            converseData.name ||
            data.converseUsername;
          data.address = converseData.address || data.address;
          data.avatar = converseData.avatar || data.avatar;
          data.converseEndpoint = converseEndpoint;
        }
      } catch (error) {
        console.error("Failed to fetch Converse profile:", error);
      }
    }

    data.preferredName = data.ensDomain || data.converseUsername || "Friend";
    infoCache.set(keyToUse, data);
    return data;
  } catch (error) {
    console.error("An error occurred in getUserInfo:", error);
    if (context) {
      await context.send(
        "Sorry, I encountered an error while fetching your information.",
      );
    }
    return null;
  }
};
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout = 5000,
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};
export const isOnXMTP = async (
  v3client: V3Client,
  v2client: V2Client,
  address: string | undefined,
) => {
  if (!address) {
    throw new Error("Address is required for XMTP validation");
  }
  try {
    const [v2, v3] = await Promise.all([
      v2client.canMessage(address || ""),
      v3client.canMessage([address || ""]),
    ]);
    return { v2, v3: v3[address || ""] };
  } catch (error) {
    console.error("Error checking XMTP availability:", error);
    throw error;
  }
};

export const PROMPT_USER_CONTENT = (userInfo: UserInfo) => {
  let { address, ensDomain, converseUsername, preferredName } = userInfo;
  let prompt = `\n\nUser context: 
- Start by fetch their domain from or Convese username
- Call the user by their name or domain, in case they have one
- Ask for a name (if they don't have one) so you can suggest domains.
- Users address is: ${address}`;
  if (preferredName) prompt += `\n- Users name is: ${preferredName}`;
  if (ensDomain) prompt += `\n- User ENS domain is: ${ensDomain}`;
  if (converseUsername)
    prompt += `\n- Converse username is: ${converseUsername}`;
  prompt += "\n\n";
  return prompt;
};

export const PROMPT_REPLACE_VARIABLES = (
  prompt: string,
  address: string,
  userInfo: UserInfo | undefined,
  tag: string,
) => {
  if (!userInfo) {
    userInfo = {
      preferredName: address,
      address: address,
      ensDomain: address,
      converseUsername: address,
    };
  }
  prompt = prompt.replaceAll("{ADDRESS}", userInfo.address || "");
  prompt = prompt.replaceAll("{ENS_DOMAIN}", userInfo.ensDomain || "");
  prompt = prompt.replaceAll(
    "{CONVERSE_USERNAME}",
    userInfo.converseUsername || "",
  );
  prompt = prompt.replaceAll("{PREFERRED_NAME}", userInfo.preferredName || "");
  prompt = prompt.replaceAll("{NAME}", tag);
  return prompt;
};
