import type { EnsData } from "./types";

const endpointURL =
  "https://converse-website-git-endpoit-ephemerahq.vercel.app";

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
  return { converseUsername: converseUsername, ensDomain: ensDomain };
}
