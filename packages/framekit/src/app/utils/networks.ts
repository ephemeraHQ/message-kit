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
    networkId: "arbitrum_sepolia",
    networkName: "Arbitrum Sepolia",
    networkLogo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=026",
    tokenName: "arbETH",
    dripAmount: 0.01,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 421614,
    tokenAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab8",
    isActive: true,
    balance: "0.01",
  },
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
    balance: "179.70",
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
    balance: "489148.00",
  },
  {
    networkId: "berachain_artio",
    networkName: "Berachain Artio",
    networkLogo: "https://avatars.githubusercontent.com/u/96059542",
    tokenName: "BERA",
    dripAmount: 0.1,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "0.00",
  },
  {
    networkId: "celo_alfajores",
    networkName: "Celo Alfajores",
    networkLogo: "https://cryptologos.cc/logos/celo-celo-logo.png?v=026",
    tokenName: "CELO",
    dripAmount: 0.05,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 42220,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "4553.99",
  },
  {
    networkId: "holesky",
    networkName: "Ethereum Holesky",
    networkLogo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    tokenName: "hETH",
    dripAmount: 0.1,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "6450.40",
  },
  {
    networkId: "eth",
    networkName: "Ethereum Mainnet",
    networkLogo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    tokenName: "ETH",
    dripAmount: 0.01,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "6450.40",
  },
  {
    networkId: "sepolia",
    networkName: "Ethereum Sepolia",
    networkLogo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    tokenName: "sETH",
    dripAmount: 0.02,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "54.45",
  },
  {
    networkId: "flow",
    networkName: "Flow Testnet",
    networkLogo: "https://cryptologos.cc/logos/flow-flow-logo.png?v=026",
    tokenName: "FLOW",
    dripAmount: 1,
    address: "0x3e2ab8b954bc0bc0",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "9964.00",
  },
  {
    networkId: "mode_sepolia",
    networkName: "Mode Sepolia",
    networkLogo:
      "https://raw.githubusercontent.com/mode-network/brandkit/ef5d79dc521a56ca5674697810407fc04f6dec71/Assets/Logo/Mode%20logo%20primary.png",
    tokenName: "ETH",
    dripAmount: 0.1,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "0.02",
  },
  {
    networkId: "optimism_sepolia",
    networkName: "Optimism Sepolia",
    networkLogo:
      "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=026",
    tokenName: "opETH",
    dripAmount: 0.01,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "2.30",
  },
  {
    networkId: "polygon_amoy",
    networkName: "Polygon Amoy",
    networkLogo: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
    tokenName: "MATIC",
    dripAmount: 0.1,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "0.03",
  },
  {
    networkId: "scroll_sepolia",
    networkName: "Scroll Sepolia",
    networkLogo:
      "https://pbs.twimg.com/profile_images/1696533090683011075/46xlNPQR_400x400.jpg",
    tokenName: "ETH",
    dripAmount: 0.01,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "6.42",
  },
  {
    networkId: "stacks",
    networkName: "Stacks Testnet",
    networkLogo: "https://cryptologos.cc/logos/stacks-stx-logo.png",
    tokenName: "STX",
    dripAmount: 1,
    address: "ST4HMZRS8XSTGEPQXNKXFAY9T45HMS4FE72Q3ED0",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "907.42",
  },
  {
    networkId: "starknet_sepolia",
    networkName: "Starknet Sepolia",
    networkLogo:
      "https://pbs.twimg.com/profile_images/1834202903189618688/N4J8emeY_400x400.png",
    tokenName: "ETH",
    dripAmount: 0.001,
    address:
      "0x012b6781F1Fbe402F75efacDD4D90bb22c69c0172b7d34bB5233854631Ca3272",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "99.64",
  },
  {
    networkId: "sui_testnet",
    networkName: "Sui Testnet",
    networkLogo:
      "https://suifoundation.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F25d4a7b2-cc43-4d0f-8b5e-7f840eef1508%2FSui_Droplet_Logo_Blue.png?table=block&id=cd93d06a-6ec4-474e-8a35-a09f4e86c3f6&spaceId=279a541f-304a-4674-a846-6f35af6d2aab&width=1570&userId=&cache=v2",
    tokenName: "SUI",
    dripAmount: 0.5,
    address:
      "0xda593ab6a600ccf74e9dc1f2ef0f7ba852bf29bcc92d91e302c33c883b333432",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "0.00",
  },
  {
    networkId: "zksync_sepolia",
    networkName: "zkSync Era Sepolia",
    networkLogo:
      "https://pbs.twimg.com/profile_images/1835668010951950336/Aq1Kg1p0_400x400.jpg",
    tokenName: "ETH",
    dripAmount: 0.01,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "369.47",
  },
  {
    networkId: "zora_sepolia",
    networkName: "Zora Sepolia",
    networkLogo: "https://docs.zora.co/zoraOrb.svg",
    tokenName: "zsETH",
    dripAmount: 0.01,
    address: "0x625BCC1142E97796173104A6e817Ee46C593b3C5",
    isERC20: false,
    erc20Address: undefined,
    erc20Decimals: undefined,
    chainId: 1115,
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isActive: true,
    balance: "7.85",
  },
];

export function extractFrameChain(txLink: string): Network {
  // if its basescan is base
  // if its seoplia is sepolia
  // if its etherscan is eth
  // if its goerli is goerli

  let network: Network | undefined = undefined;
  for (const netWork of db) {
    if (txLink === netWork.networkId) {
      network = netWork;
      break;
    }
  }
  if (network === undefined) {
    if (txLink?.includes("etherscan.io")) {
      network = db.find((n) => n.networkId === "eth");
    } else if (txLink?.includes("goerli.etherscan.io")) {
      network = db.find((n) => n.networkId === "eth_goerli");
    } else if (txLink?.includes("sepolia.etherscan.io")) {
      network = db.find((n) => n.networkId === "eth_sepolia");
    } else if (txLink?.includes("sepolia.basescan.org")) {
      network = db.find((n) => n.networkId === "base_sepolia");
    } else if (txLink?.includes("goerli.basescan.org")) {
      network = db.find((n) => n.networkId === "base_goerli");
    } else if (txLink?.includes("basescan.org")) {
      network = db.find((n) => n.networkId === "base");
    }
  }
  if (network === undefined) {
    console.error(`Network ${network} not found`);
    return {
      networkId: "",
      networkName: "",
      networkLogo: "",
      tokenName: "",
      dripAmount: 0,
      address: "",
      isERC20: false,
      erc20Address: undefined,
      erc20Decimals: undefined,
      chainId: 0,
      tokenAddress: "",
      isActive: false,
      balance: "0",
    };
  }
  return network;
}
