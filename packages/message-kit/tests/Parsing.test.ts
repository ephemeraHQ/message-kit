// @ts-nocheck
import { describe, test, expect } from "vitest";
import { parseSkill, findSkill } from "../src/helpers/skills";
import { agent } from "../../../templates/ens/src/index";
import { fail } from "assert";
import { UserInfo } from "xmtp";

describe("Parsing tests", () => {
  test.each([
    ["/check vitalik.eth", "check", { domain: "vitalik.eth" }],
    ["/register vitalik.eth", "register", { domain: "vitalik.eth" }],
    ["/cool vitalik.eth", "cool", { domain: "vitalik.eth" }],
    ["/renew vitalik.eth", "renew", { domain: "vitalik.eth" }],
    ["/info vitalik.eth", "info", { domain: "vitalik.eth" }],
    [
      "/pay vitalik.eth",
      "pay",
      {
        username: Object.freeze<UserInfo>({
          ensDomain: "vitalik.eth",
          address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          converseUsername: undefined,
          ensInfo: {
            address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            avatar: "https://euc.li/vitalik.eth",
            avatar_small: "https://ensdata.net/media/avatar/vitalik.eth",
            avatar_url: "https://euc.li/vitalik.eth",
            contentHash:
              "bafybeifvusbh4iunpvwjlowu47sxnt4hjlebx46kxi4yz5zdsoecfpkkei",
            description: "mi pinxe lo crino tcati",
            ens: "vitalik.eth",
            ens_primary: "vitalik.eth",
            github: "vbuterin",
            header:
              "https://pbs.twimg.com/profile_banners/295218901/1638557376/1500x500",
            resolverAddress: "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
            twitter: "VitalikButerin",
            url: "https://vitalik.ca",
            wallets: { eth: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
          },
          avatar: "https://euc.li/vitalik.eth",
          converseEndpoint: "https://converse.xyz/profile/vitalik.eth",
          preferredName: "vitalik.eth",
        }),
        amount: 10,
        token: "usdc",
        address: "",
      },
    ],
  ])(
    "Compare extracted values from skill: %s",
    async (input, expectedSkill, expectedParams) => {
      const skillAction = findSkill(input, agent?.skills);
      if (skillAction) {
        const extractedValues = await parseSkill(input, skillAction);
        expect(extractedValues?.skill).toBe(expectedSkill);
        expect(extractedValues?.params).toEqual(expectedParams);
      } else {
        fail(`No skill found for input: ${input}`);
      }
    },
  );
}, 15000);
