import { describe, test, expect } from "vitest";
import { parseSkill, findSkill } from "../lib/skills";
import { agent as web3Agent } from "../../../../templates/agent/src/index";
import { agent as groupAgent } from "../../../../templates/group/src/index";

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
      const skillAction = findSkill(input, groupAgent.skills);
      const extractedValues = skillAction
        ? parseSkill(input, skillAction)
        : undefined;
      expect(extractedValues?.skill).toBe(expectedSkill);
      expect(extractedValues?.params).toEqual(expectedParams);
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
      const skillAction = findSkill(input, web3Agent.skills);
      const extractedValues = skillAction
        ? parseSkill(input, skillAction)
        : undefined;
      expect(extractedValues?.skill).toBe(expectedSkill);
      expect(extractedValues?.params).toEqual(expectedParams);
    },
  );
});
