import { isAddress } from "viem";

export const converseEndpointURL = "https://converse.xyz/profile/";

export type InfoCache = Map<string, UserInfo>;
export type ConverseProfile = {
  address: string | undefined;
  onXmtp: boolean;
  avatar: string | undefined;
  formattedName: string | undefined;
  name: string | undefined;
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
