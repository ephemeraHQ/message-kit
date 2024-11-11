import "dotenv/config";
import { describe, test, expect } from "vitest";
import { UserInfo } from "../../helpers/resolver";
import { skills as agentSkills } from "../skills/skills_agent";
import { skills as groupSkills } from "../skills/skills_group";
import { agent_prompt as agentPrompt } from "./prompt_agent";
import { AbstractedMember } from "../../helpers/types";
import { parseSkill } from "../../lib/skills";

describe("Skill tests", async () => {
  test("should handle game skill correctly", async () => {
    const inputContent = "/swap 1 eth to usdc";
    const extractedValues = parseSkill(inputContent, groupSkills);
    expect(extractedValues.skill).toBe("swap");
  });
  /*
  const sender: AbstractedMember = {
    address: "0x3a044b218BaE80E5b9E16609443A192129A67BeA",
    inboxId: "da3750159ea7541dda1e271076a3663d8c14576ab85bbd3416d45c9f19e35cbc",
    accountAddresses: ["0x3a044b218BaE80E5b9E16609443A192129A67BeA"],
  };
  const members: AbstractedMember[] = [sender];
  let userInfo: UserInfo = {
    address: sender.address,
    preferredName: sender.address,
  };
  const systemPrompt = await agentPrompt(userInfo);
  test("should handle game skill correctly", async () => {
    const inputContent = "@agent lets swap 1 eth to usdc";
    const extractedValues = parseSkill(inputContent, agentSkills);
    expect(extractedValues).toEqual({
      skill: "swap",
      params: {
        amount: 1,
        token_from: "eth",
        token_to: "usdc",
      },
    });
  });

  test("Extract values from @agent lets swap 1 eth to usdc ", () => {
    const inputContent = "@agent lets swap 1 eth to usdc";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "swap",
      params: {
        amount: 1,
        token_from: "eth",
        token_to: "usdc",
      },
    });
  });
  
  test("Extract values from @bot thks! ", () => {
    const inputContent = "@bot thks!";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "bot",
      params: {
        thanks: true,
      },
    });
  });

  test("Extract values from @bot prompt ", () => {
    const inputContent = "@bot Hello, how can I assist you today?";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "agent",
      params: expect.objectContaining({
        prompt: "Hello, how can I assist you today?",
      }),
    });
  });

  test("Extract values from @bot tell a joke ", () => {
    const inputContent = "@bot tell a joke";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "agent",
      params: {
        prompt: "tell a joke",
      },
    });
  });
  test("Extract values from @bot lets play a game ", () => {
    const inputContent = "@bot lets play a game";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "agent",
      params: {
        prompt: "lets play a game",
      },
    });
  });

  */
});
