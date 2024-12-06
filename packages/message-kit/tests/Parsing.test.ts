import { describe, test, expect, fail } from "vitest";
import { parseSkill, findSkill } from "../src/lib/skills";
import { agent as web3Agent } from "../../../templates/ens/src/index";

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
      { username: "vitalik.eth", amount: 10, token: "usdc" },
    ],
  ])(
    "Compare extracted values from skill: %s",
    (input, expectedSkill, expectedParams) => {
      const skillAction = findSkill(input, web3Agent.skills);
      if (skillAction) {
        const extractedValues = parseSkill(input, skillAction);
        console.log(extractedValues);
        expect(extractedValues?.skill).toBe(expectedSkill);
        expect(extractedValues?.params).toEqual(expectedParams);
      } else {
        fail(`No skill found for input: ${input}`);
      }
    },
  );
});
