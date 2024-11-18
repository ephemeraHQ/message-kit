import { describe, test, expect } from "vitest";
import { getUserInfo } from "../../src/helpers/resolver";
import { agentParse } from "../../src/helpers/gpt";
import { agent_prompt } from "../../../../templates/group/src/prompt";

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
      const userInfo = await getUserInfo(sender.address);
      if (!userInfo) throw new Error("User info not found");
      const systemPrompt = await agent_prompt(sender.address);
      const reply = await agentParse(userPrompt, sender.address, systemPrompt);
      console.log(reply);
      expect(reply).toContain(expectedPattern); // This will pass if "/game wordle" appears anywhere in the reply
    },
  );
}, 15000); // Added 15 second timeout
