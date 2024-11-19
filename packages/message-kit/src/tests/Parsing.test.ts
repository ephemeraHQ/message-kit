import { describe, test, expect } from "vitest";
import { parseSkill } from "../lib/skills";
import { skills as skillsGroup } from "../../../../templates/group/src/index";
import { skills as skillsEns } from "../../../../templates/agent/src/index";

describe("Parsing extraction tests", () => {
  test.each([
    [
      "/tip @vitalik 10 usdc",
      "tip",
      { username: ["@vitalik"], amount: 10, token: "usdc" },
    ],
    [
      "/pay 10 usdc vitalik.eth",
      "pay",
      { amount: 10, token: "usdc", username: "vitalik.eth" },
    ],
    ["/game wordle", "game", { game: "wordle" }],
    ["/help", "help", {}],
    ["/game help", "game", { game: "help" }],
    ["🔎", undefined, {}],
  ])(
    "Compare extracted values from skill: %s",
    (input, expectedSkill, expectedParams) => {
      const extractedValues = parseSkill(input, skillsGroup);
      expect(extractedValues.skill).toBe(expectedSkill);
      expect(extractedValues.params).toEqual(expectedParams);
    },
  );
});

describe("Parsing tests", () => {
  test.each([
    ["/check vitalik.eth", "check", { domain: "vitalik.eth" }],
    ["/register vitalik.eth", "register", { domain: "vitalik.eth" }],
    ["/cool vitalik.eth", "cool", { domain: "vitalik.eth" }],
    ["/renew vitalik.eth", "renew", { domain: "vitalik.eth" }],
    ["/info vitalik.eth", "info", { domain: "vitalik.eth" }],
    [
      "/tip 0x1234567890123456789012345678901234567890",
      "tip",
      { address: "0x1234567890123456789012345678901234567890" },
    ],
  ])(
    "Compare extracted values from skill: %s",
    (input, expectedSkill, expectedParams) => {
      const extractedValues = parseSkill(input, skillsEns);
      expect(extractedValues.skill).toBe(expectedSkill);
      expect(extractedValues.params).toEqual(expectedParams);
    },
  );
});
