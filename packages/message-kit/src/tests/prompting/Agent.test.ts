import "dotenv/config";
import { describe, test, expect } from "vitest";
import { getUserInfo } from "../../helpers/resolver";
import { agentParse, clearMemory } from "../../helpers/gpt";
import { agent_prompt } from "../../../../../templates/agent/src/index";
const sender = {
  address: "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
  converseUsername: "humanagent",
};

describe("Prompting tests", () => {
  const testCases = [
    ["hi", "Fabri"],
    ["I want to get info for vitalik.eth", "/info vitalik.eth"],
    // Update the expected pattern for the "renew my domain" case
    ["renew my domain", "/check Fabri.eth"],
    ["domain info for humanagent.eth", "/info humanagent.eth"],
    ["tip vitalik.eth", "/tip 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
  ];

  test.each(testCases)(
    "should handle %s correctly",
    async (userPrompt, expectedPattern) => {
      clearMemory();
      let address = sender.address.toLowerCase();
      const userInfo = await getUserInfo(address);
      if (!userInfo) throw new Error("User info not found");
      const systemPrompt = await agent_prompt(address);
      if (!systemPrompt) throw new Error("System prompt not found");
      const reply = await agentParse(userPrompt, address, systemPrompt);
      expect(reply).toContain(expectedPattern);
    },
  );
}, 15000);
