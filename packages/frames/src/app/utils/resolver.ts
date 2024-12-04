import { isAddress } from "viem";

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
  address?: string;
  preferredName?: string;
  avatar?: string;
  bio?: string;
};

export async function getUserInfo(identifier: string): Promise<UserInfo> {
  try {
    // Add CORS proxy or use environment variable for the API endpoint
    const response = await fetch(`/api/resolve?identifier=${identifier}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      address: data.address,
      preferredName: data.preferredName || identifier,
      avatar: data.avatar,
      bio: data.bio,
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    // Return basic info if resolution fails
    return {
      address: identifier,
      preferredName: identifier,
    };
  }
}

let infoCache: InfoCache = new Map();

export const clearInfoCache = (address?: string) => {
  if (address) {
    infoCache.delete(address);
  } else {
    infoCache.clear();
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

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.warn(`Request timed out after ${timeout}ms: ${url}`);
      } else if (
        error.name === "TypeError" &&
        error.message === "Failed to fetch"
      ) {
        console.warn(`Network error or CORS issue when fetching ${url}`);
      } else {
        console.warn(`Fetch error for ${url}: ${error.message}`);
      }
    } else {
      console.warn(`Unknown error while fetching ${url}`);
    }

    // Return null to indicate fetch failure
    return null;
  }
};
