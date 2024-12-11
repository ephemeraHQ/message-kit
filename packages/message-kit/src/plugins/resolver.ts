import { isAddress } from "viem";
import { V2Client, V3Client } from "../index";
import { XMTPContext } from "../lib/xmtp";

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

class UserInfoCache {
  private static instance: UserInfoCache;
  private cache: InfoCache = new Map();

  private constructor() {}

  public static getInstance(): UserInfoCache {
    if (!UserInfoCache.instance) {
      UserInfoCache.instance = new UserInfoCache();
    }
    return UserInfoCache.instance;
  }

  get(key: string): UserInfo | undefined {
    return this.cache.get(key.toLowerCase());
  }

  set(key: string, data: UserInfo): void {
    this.cache.set(key.toLowerCase(), data);
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key.toLowerCase());
    } else {
      this.cache.clear();
    }
  }
}

// Use the singleton instance
export const userInfoCache = UserInfoCache.getInstance();

export const getUserInfo = async (
  key: string,
  clientAddress?: string,
  context?: XMTPContext,
): Promise<UserInfo | null> => {
  let data: UserInfo = {
    ensDomain: undefined,
    address: undefined,
    converseUsername: undefined,
    ensInfo: undefined,
    avatar: undefined,
    converseEndpoint: undefined,
    preferredName: undefined,
  };

  if (typeof key !== "string") {
    console.error("userinfo key must be a string");
    return data;
  }

  const cachedData = userInfoCache.get(key);
  if (cachedData) return cachedData;

  key = key?.toLowerCase();
  clientAddress = clientAddress?.toLowerCase();

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
    console.log("Unable to determine a valid key for fetching user info.");
    return data;
  } else {
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
        console.error(`Failed to fetch ENS data for ${keyToUse}`);
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
        if (!response?.ok) {
          console.error(
            `Converse profile request failed with status ${response?.status}`,
          );
        }
        const converseData = (await response?.json()) as ConverseProfile;
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
    userInfoCache.set(keyToUse, data);
    return data;
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
    console.error("fetching");
  }
};
export const isOnXMTP = async (
  v3client: V3Client | null,
  v2client: V2Client | null,
  address: string,
) => {
  try {
    const [v2, v3] = await Promise.all([
      v2client ? v2client.canMessage(address) : false,
      v3client ? v3client.canMessage([address]) : false,
    ]);
    return {
      v2,
      v3: v3 ? (v3 as Map<string, boolean>).get(address) : false,
    };
  } catch (error) {
    console.error("Error checking XMTP availability:", error);
    return { v2: false, v3: false }; // Return default values on error
  }
};

export const replaceUserContext = (userInfo: UserInfo) => {
  let { address, ensDomain, converseUsername, preferredName } = userInfo;
  let prompt = `## User context
- Start by fetch their domain from or Converse username
- Call the user by their name or domain, in case they have one
- Ask for a name (if they don't have one) so you can suggest domains.
- Message sent date: ${new Date().toISOString()}
- Users address is: ${address}`;
  if (preferredName) prompt += `\n- Users name is: ${preferredName}`;
  if (ensDomain) prompt += `\n- User ENS domain is: ${ensDomain}`;
  if (converseUsername)
    prompt += `\n- Converse username is: ${converseUsername}`;
  return prompt;
};
