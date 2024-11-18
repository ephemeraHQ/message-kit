import { describe, test, expect } from "vitest";
import { agentParse, clearMemory, replaceVariables } from "../../helpers/gpt";
import { skills } from "../../../../../templates/agent/src/skills";
import { systemPrompt } from "../../../../../templates/agent/src/prompt";

const sender = {
  address: "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
  converseUsername: "humanagent",
};

describe("Prompting tests", () => {
  const testCases = [
    ["hi", "Fabri"],
    ["I want to get info for vitalik.eth", "/info vitalik.eth"],
    [
      "renew my domain",
      [
        "/check fabri.eth",
        "/check humanagent.eth",
        "/renew humanagent.eth",
        "/renew fabri.base.eth",
      ],
    ],
    [
      "domain info for humanagent.eth",
      ["/info humanagent.eth", "/check humanagent.eth"],
    ],
    [
      "tip vitalik.eth",
      [
        "/tip vitalik.eth",
        "/info vitalik.eth",
        "/tip 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "/tip",
      ],
    ],
  ];

  test.each(testCases)(
    "should handle %s correctly",
    async (userPrompt, expectedPatterns) => {
      clearMemory();
      let prompt = await replaceVariables(
        systemPrompt,
        sender.address,
        skills,
        "@bot",
      );
      const reply = await agentParse(
        userPrompt as string,
        sender.address,
        prompt,
      );
      let matches = false as boolean | undefined;
      if (Array.isArray(expectedPatterns)) {
        for (const pattern of expectedPatterns) {
          if (reply?.toLowerCase().includes(pattern.toLowerCase())) {
            matches = true;
          }
        }
      } else {
        matches = reply?.toLowerCase().includes(expectedPatterns.toLowerCase());
      }
      if (!matches) {
        console.log("userPrompt", userPrompt);
        console.log("reply", reply);
        console.log("expectedPatterns", expectedPatterns);
        console.log("matches", matches);
      }
      expect(matches).toBe(true);
    },
  );
}, 15000);
