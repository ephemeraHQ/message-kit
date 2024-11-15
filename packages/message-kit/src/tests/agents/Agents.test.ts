import "dotenv/config";
import { describe, test, expect } from "vitest";
import { getUserInfo } from "../../helpers/resolver";
import { agentParse } from "../../helpers/gpt";
import { agent_prompt } from "./prompt_agent";

describe("Skill tests", async () => {
  test("should handle game skill correctly", async () => {
    let userPrompt = "check vitalik.eth";
    let sender = {
      address: "0x3a044b218BaE80E5b9E16609443A192129A67BeA",
    };
    const userInfo = await getUserInfo(sender.address);
    if (!userInfo) {
      throw new Error("User info not found");
    }
    let systemPrompt = await agent_prompt(userInfo);

    const reply = await agentParse(userPrompt, sender.address, systemPrompt);
    expect(reply).toContain("/cool vitalik.eth");
  });
});
