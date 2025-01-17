type Network = {
  networkId: string;
  networkName: string;
  networkLogo: string;
  tokenName: string;
  dripAmount: number;
  address: string;
  chainId: number;
  tokenAddress: string;
  isERC20: boolean;
  erc20Address: string | undefined;
  erc20Decimals: number | undefined;
  isActive: boolean;
  balance: string;
};
const db = [
  {
    networkId: "base",
    networkName: "Base",
    networkLogo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    tokenName: "USDC",
    dripAmount: 0.01,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 8453,
    tokenAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    isActive: true,
    balance: "179.70",
  },
  {
    networkId: "base_goerli",
    networkName: "Base Goerli",
    networkLogo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    tokenName: "bgETH",
    dripAmount: 0.01,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 84532,
    tokenAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab8",
    isActive: true,
    balance: "179.70",
  },
  {
    networkId: "base_sepolia",
    networkName: "Base Sepolia",
    networkLogo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    tokenName: "bsETH",
    dripAmount: 0.01,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 84532,
    tokenAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab8",
    isActive: true,
    balance: "0",
  },
  {
    networkId: "base_sepolia_usdc",
    networkName: "Base Sepolia USDC",
    networkLogo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    tokenName: "bUSDC",
    dripAmount: 1,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: true,
    erc20Address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    erc20Decimals: 6,
    chainId: 84532,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "0",
  },
];

export function extractFrameChain(txLink: string): Network {
  let network: Network | undefined = undefined;
  for (const netWork of db) {
    if (txLink === netWork.networkId) {
      network = netWork;
      break;
    }
  }
  if (network === undefined) {
    if (txLink?.includes("sepolia.basescan.org")) {
      network = db.find((n) => n.networkId === "base_sepolia");
    } else if (txLink?.includes("goerli.basescan.org")) {
      network = db.find((n) => n.networkId === "base_goerli");
    } else if (txLink?.includes("basescan.org")) {
      network = db.find((n) => n.networkId === "base");
    }
  }
  if (!network) {
    throw new Error("Network not found");
  }
  return network;
}
