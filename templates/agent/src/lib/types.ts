export type chatHistories = Record<string, any[]>;
export type ensDomain = Record<string, string | undefined>;
export type converseUsername = Record<string, string | undefined>;
export type tipAddress = Record<string, string | undefined>;
export type tipDomain = Record<string, string | undefined>;

export type InfoCache = {
  [key: string]: { info: EnsData };
};
export const frameUrl = "https://ens.steer.fun/";
export const ensUrl = "https://app.ens.domains/";
export const baseTxUrl = "https://base-tx-frame.vercel.app";
export const endpointURL =
  "https://converse-website-git-endpoit-ephemerahq.vercel.app";

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
