import "dotenv/config";
import { describe, test, expect } from "vitest";
import { getUserInfo } from "../../helpers/resolver";
import { agentParse } from "../../helpers/gpt";
import { agent_prompt } from "../../../../../templates/agent/src/index";
const sender = {
  address: "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
  converseUsername: "humanagent",
};

describe("Prompting tests", () => {
  const testCases = [
    ["hi", "fabri"],
    ["I want to get info for vitalik.eth", "/info vitalik.eth"],
    ["renew my domain", "/renew humanagent.eth"],
    ["domain info for humanagent.eth", "/info humanagent.eth"],
    ["tip vitalik.eth", "/tip 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
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
