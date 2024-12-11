import axios from "axios";

export const SUPPORTED_NETWORKS = [
  "arbitrum_goerli",
  "arbitrum_sepolia",
  "base_goerli",
  "base_sepolia",
  "base_sepolia_usdc",
  "celo_alfajores",
  "fantom_testnet",
  "goerli",
  "holesky",
  "linea_goerli",
  "linea_sepolia",
  "manta_testnet",
  "mode_sepolia",
  "morph_sepolia",
  "optimism_goerli",
  "optimism_sepolia",
  "polygon_amoy",
  "polygon_mumbai",
  "polygon_zkevm",
  "scroll_sepolia",
  "sepolia",
  "taiko_jolnir",
  "zksync_sepolia",
  "zora_sepolia",
] as const;

export const CLAIM_EVERY = 24 * 60 * 60 * 1000; // 24 hours

export const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours

export const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes

export const EVM_TOKENS = ["ETH", "MATIC", "USDC", "CELO", "BERA"];

export interface Network {
  networkId: string;
  networkName: string;
  networkLogo: string;
  tokenName: string;
  dripAmount: number;
  address: string;
  isERC20: boolean;
  erc20Address?: string;
  erc20Decimals?: number;
  isActive: boolean;
  balance: string;
}
export interface DripTokensResponse {
  ok: boolean;
  error?: string;
  value?: string;
}

export class LearnWeb3Client {
  public BASE_URL = "https://learnweb3.io/api/faucet";
  private apiKey = process.env.LEARN_WEB3_API_KEY;
  constructor() {
    if (!process.env.LEARN_WEB3_API_KEY) {
      throw new Error("Please set the LEARN_WEB3_API_KEY environment variable");
    }
    this.apiKey = process.env.LEARN_WEB3_API_KEY;
  }

  async getNetworks(onlyEvm = true): Promise<Network[]> {
    const response = await axios(`${this.BASE_URL}/networks`);
    const data: Network[] = response.data;
    if (onlyEvm) {
      return data.filter(
        (network) =>
          EVM_TOKENS.some((t) =>
            network.tokenName.toLowerCase().includes(t.toLowerCase())
          ) && network.isActive
      );
    }
    return data.filter((network) => network.isActive);
  }

  async dripTokens(
    networkId: string,
    recipientAddress: string
  ): Promise<DripTokensResponse> {
    const response = await axios.post(
      `${this.BASE_URL}/drip`,
      { networkId, recipientAddress },
      {
        headers: {
          authorization: `Bearer ${this.apiKey}`,
        },
      }
    );
    return response.data;
  }
}
