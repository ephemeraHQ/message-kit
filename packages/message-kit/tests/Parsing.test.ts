import { describe, test, expect } from "vitest";
import { parseSkill, findSkill } from "../src/lib/skills";
import { agent } from "../../../templates/ens/src/index";
import { fail } from "assert";

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
        username: "vitalik.eth",
        amount: 10,
        token: "usdc",
        address: "",
      },
    ],
  ])(
    "Compare extracted values from skill: %s",
    async (input, expectedSkill, expectedParams) => {
      // @ts-ignore
      const skillAction = findSkill(input, agent?.skills);
      if (skillAction) {
        const extractedValues = await parseSkill(input, skillAction);
        console.log(extractedValues);
        expect(extractedValues?.skill).toBe(expectedSkill);
        expect(extractedValues?.params).toEqual(expectedParams);
      } else {
        fail(`No skill found for input: ${input}`);
      }
    },
  );
});
