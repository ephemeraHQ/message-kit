import { describe, test, expect } from "vitest";
import { parseSkill } from "../../src/lib/skills";
import { skills as skillsGroup } from "../../../../templates/group/src/skills";

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
