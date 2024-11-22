import { test, expect } from "vitest";
import { Agent } from "../helpers/types";
import { clearMemory, replaceVariables, agentParse } from "../helpers/gpt";
import { clearInfoCache } from "../helpers/resolver";

export function testPrompt(
  testCases: [string, string | string[]][],
  agent: Agent,
  systemPrompt: string,
  sender: { address: string; converseUsername: string },
) {
  clearMemory();
  clearInfoCache();
  test.each(testCases)(
    "should handle %s correctly",
    async (userPrompt, expectedPatterns) => {
      let prompt = await replaceVariables(systemPrompt, sender.address, agent);
      const reply = await agentParse(
        userPrompt as string,
        sender.address,
        prompt,
      );
      let matches = false;
      if (Array.isArray(expectedPatterns)) {
        matches = expectedPatterns.some((pattern) =>
          reply?.toLowerCase().includes(pattern.toLowerCase()),
        );
      } else {
        matches =
          reply?.toLowerCase().includes(expectedPatterns.toLowerCase()) ??
          false;
      }

      if (matches !== true) {
        console.log("userPrompt", userPrompt);
        console.log("reply", reply);
        console.log("expectedPatterns", expectedPatterns);
        console.log("matches", matches);
      }
      expect(matches).toBe(true);
    },
  );
}
