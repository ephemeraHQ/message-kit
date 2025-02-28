import { describe, test, expect } from "vitest";
import { extractFrameChain } from "../../base-links/src/app/utils/networks";

describe("Frame Chain Tests", () => {
  test.each([
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
        tokenName: "USDC",
        dripAmount: 0.01,
      },
    ],
    [
      "https://basescan.org/address/0x0000000000000000000000000000000000000000",
      {
        networkLogo:
          "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
        networkName: "Base",
        tokenName: "USDC",
        dripAmount: 0.01,
      },
    ],
    [
      "base",
      {
        networkLogo:
          "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
        networkName: "Base",
        tokenName: "USDC",
        tokenAddress: "0x83358384d0c3d8e8938733c8b9833f3c44db03d4",
        chainId: "0x2105",
        dripAmount: 0.01,
      },
    ],
  ])("Extract frame chain: %s", (input, expected) => {
    const extractedValues = extractFrameChain(input);
    expect(extractedValues?.networkLogo).toEqual(expected.networkLogo);
    expect(extractedValues?.networkName).toEqual(expected.networkName);
    expect(extractedValues?.tokenName).toEqual(expected.tokenName);
    expect(extractedValues?.dripAmount).toEqual(expected.dripAmount);
  });
});
