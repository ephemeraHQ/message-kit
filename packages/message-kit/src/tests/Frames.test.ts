import { describe, test, expect } from "vitest";
import { extractFrameChain } from "../helpers/utils";

describe("Frame Chain Tests", () => {
  test.each([
    [
      "https://etherscan.io/tx/0x6c43658dfaaa4a2cecfe1646da8c4130a630f46b4eff590c71c711be7b2c5c8a",
      {
        networkLogo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        networkName: "Ethereum Mainnet",
        tokenName: "ETH",
        dripAmount: 0.01,
      },
    ],
    [
      "https://sepolia.basescan.org/tx/0xd60833f6e38ffce6e19109cf525726f54859593a0716201ae9f6444a04765a37",
      {
        networkLogo:
          "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
        networkName: "Base Sepolia",
        tokenName: "bsETH",
        dripAmount: 0.01,
      },
    ],
    [
      "https://basescan.org/tx/0x6c43658dfaaa4a2cecfe1646da8c4130a630f46b4eff590c71c711be7b2c5c8a",
      {
        networkLogo:
          "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
        networkName: "Base",
        tokenName: "ETH",
        dripAmount: 0.01,
      },
    ],
  ])("Compare extracted values from skill: %s", (input, expected) => {
    const extractedValues = extractFrameChain(input);
    expect(extractedValues?.networkLogo).toEqual(expected.networkLogo);
    expect(extractedValues?.networkName).toEqual(expected.networkName);
    expect(extractedValues?.tokenName).toEqual(expected.tokenName);
    expect(extractedValues?.dripAmount).toEqual(expected.dripAmount);
  });
});
