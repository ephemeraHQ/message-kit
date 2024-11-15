import "dotenv/config";
import { describe, test, expect } from "vitest";
import { parseSkill } from "../../lib/skills";
import { skills as skillsEns } from "../../../../../templates/agent/src/skills";

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
