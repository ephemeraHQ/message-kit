// @ts-nocheck
import { describe, test, expect } from "vitest";
import { agentParse, clearMemory, replaceVariables } from "../../helpers/gpt";
import { skills } from "../../../../../templates/group/src/skills";
import { systemPrompt } from "../../../../../templates/group/src/prompt";

const sender = {
  address: "0x3a044b218BaE80E5b9E16609443A192129A67BeA",
  converseUsername: "alix",
};

describe("Prompting tests", () => {
  const testCases = [
    ["@bot let's play a game", "/game wordle"], // second parameter is just what we want to find
    ["@bot let's tip @alix 10 usdc", "/tip @alix 10 usdc"],
  ];

  test.each(testCases)(
    "should handle %s correctly",

    async (userPrompt, expectedPattern) => {
      clearMemory();
      let prompt = await replaceVariables(
        systemPrompt,
        sender.address,
        skills,
        "@bot",
      );
      const reply = await agentParse(userPrompt, sender.address, prompt);
      expect(reply).toContain(expectedPattern);
    },
  );
}, 15000); // Added 15 second timeout
