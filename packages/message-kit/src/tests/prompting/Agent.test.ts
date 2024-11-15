import "dotenv/config";
import { describe, test, expect } from "vitest";
import { getUserInfo } from "../../helpers/resolver";
import { agentParse } from "../../helpers/gpt";
import { agent_prompt } from "../../../../../templates/agent/src/prompt";
const sender = {
  address: "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
  converseUsername: "humanagent",
};

describe("Prompting tests", () => {
  const testCases = [
    ["hi", "/check humanagent.eth"],
    ["I want an ENS domain", "/check humanagent.eth"],
    ["renew my domain", "/renew humanagent.eth"],
    ["domain info for humanagent.eth", "/info humanagent.eth"],
  ];

  test.each(testCases)(
    "should handle %s correctly",
    async (userPrompt, expectedPattern) => {
      const userInfo = await getUserInfo(sender.address);
      if (!userInfo) throw new Error("User info not found");
      const systemPrompt = await agent_prompt(sender.address);
      if (!systemPrompt) throw new Error("System prompt not found");
      const reply = await agentParse(userPrompt, sender.address, systemPrompt);
      console.log(reply);
      expect(reply).toContain(expectedPattern); // This will pass if "/game wordle" appears anywhere in the reply
    },
  );
}, 15000); // Added 15 second timeout
