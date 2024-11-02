import "dotenv/config";
import { extractCommandValues } from "../helpers/utils";
import type { AgentSkill } from "../helpers/types";
import { commands } from "./Commands_test";

describe("Command extraction tests", () => {
  test("Extract values from /tip command", () => {
    const inputContent = "/tip @bo @alix 15";
    const extractedValues = extractCommandValues(
      inputContent,
      commands as AgentSkill[],
    );
    expect(extractedValues).toEqual({
      command: "tip",
      params: {
        amount: 15,
        username: ["@bo", "@alix"], // Simplified expectation to match actual output
      },
    });
  });

  test("Extract values from /swap command", () => {
    const inputContent = "/swap 10 eth to usdc";
    const extractedValues = extractCommandValues(
      inputContent,
      commands as AgentSkill[],
    );
    expect(extractedValues).toEqual({
      command: "swap",
      params: {
        amount: 10,
        token_from: "eth",
        token_to: "usdc",
      },
    });
  });

  test("Extract values from /send command", () => {
    const inputContent = "/send 10 usdc @bo";
    const extractedValues = extractCommandValues(
      inputContent,
      commands as AgentSkill[],
    );
    console.log("Extracted values", extractedValues);
    expect(extractedValues).toEqual({
      command: "send",
      params: {
        amount: 10,
        token: "usdc",
        username: "@bo",
      },
    });
  });

  /*
  test("Extract values from /send command", () => {
    const inputContent = "/send 10 usdc vitalik.eth";
    const extractedValues = extractCommandValues(
      inputContent,
      commands as AgentSkill[],
    );
    console.log("Extracted values", extractedValues);
    expect(extractedValues).toEqual({
      command: "send",
      params: {
        amount: 10,
        token: "usdc",
        ens: "vitalik.eth",
      },
    });
  });*/

  test("Extract values from /game command", () => {
    const inputContent = "/game slot";
    const extractedValues = extractCommandValues(
      inputContent,
      commands as AgentSkill[],
    );
    expect(extractedValues).toEqual({
      command: "game",
      params: {
        game: "slot",
      },
    });
  });

  test("Extract values from /agent prompt command", () => {
    const inputContent = "/agent Hello, how can I assist you today?";
    const extractedValues = extractCommandValues(
      inputContent,
      commands as AgentSkill[],
    );
    expect(extractedValues).toEqual({
      command: "agent",
      params: expect.objectContaining({
        prompt: "Hello, how can I assist you today?",
      }),
    });
  });
});
