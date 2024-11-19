import { test, expect } from "vitest";
import { clearMemory, replaceVariables, agentParse } from "../helpers/gpt";

export function testPrompt(
  testCases: [string, string | string[]][],
  skills: any,
  systemPrompt: string,
  tag: string,
  sender: { address: string; converseUsername: string },
) {
  test.each(testCases)(
    "should handle %s correctly",
    async (userPrompt, expectedPatterns) => {
      clearMemory();
      let prompt = await replaceVariables(
        systemPrompt,
        sender.address,
        skills,
        tag,
      );
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
