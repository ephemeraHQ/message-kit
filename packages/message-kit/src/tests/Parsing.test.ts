import { describe, test, expect } from "vitest";
import { parseSkill, findSkill } from "../lib/skills";
import { agent as web3Agent } from "../../../../templates/agent/src/index";
import { agent as groupAgent } from "../../../../templates/group/src/index";

describe("Parsing extraction tests", () => {
  test.each([
    [
      "/pay @vitalik 10 usdc",
      "pay",
      { username: "@vitalik", amount: 10, token: "usdc" },
    ],
    [
      "/pay 5 usdc vitalik.eth",
      "pay",
      { amount: 5, token: "usdc", username: "vitalik.eth" },
    ],
    ["/game wordle", "game", { game: "wordle" }],
    ["/help", "help", {}],
    ["/game help", "game", { game: "help" }],
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
        console.log("No skill found");
        expect(true).toBe(false);
      }
    },
  );
});
