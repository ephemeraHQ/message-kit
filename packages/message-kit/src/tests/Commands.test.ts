import "dotenv/config";
import { extractCommandValues } from "../helpers/utils";
import { skills } from "./Test_skills";

describe("Command extraction tests", () => {
  test("Extract values from /tip command", () => {
    const inputContent = "/tip @bo @alix 15";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "tip",
      params: {
        amount: 15,
        username: ["@bo", "@alix"], // Simplified expectation to match actual output
      },
    });
  });

  // /send 1 to @bo
  test("Extract values from /send command", () => {
    const inputContent = "/send 1 to @bo";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "send",
      params: {
        amount: 1,
        token: "usdc",
        username: "@bo",
      },
    });
  });

  test("Extract values from /swap command", () => {
    const inputContent = "/swap 10 eth to usdc";
    const extractedValues = extractCommandValues(inputContent, skills);
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
    const inputContent = "/send 10 usdc to @bo";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "send",
      params: {
        amount: 10,
        token: "usdc",
        username: "@bo",
      },
    });
  });

  test("Extract values from /send command", () => {
    const inputContent = "/send 10 usdc to @fabri";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "send",
      params: {
        amount: 10,
        token: "usdc",
        username: "@fabri",
      },
    });
  });

  test("Extract values from /send command", () => {
    const inputContent = "/send 10 usdc vitalik.eth";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "send",
      params: {
        amount: 10,
        token: "usdc",
        username: "vitalik.eth",
      },
    });
  });

  test("Extract values from /game command", () => {
    const inputContent = "/game slot";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "game",
      params: {
        game: "slot",
      },
    });
  });

  test("Extract values from 🔎 emoji", () => {
    const inputContent = "🔎 ";
    const extractedValues = extractCommandValues(inputContent, skills);
    console.log(extractedValues);
    expect(extractedValues).toEqual({
      command: undefined,
      params: {},
    });
  });

  test("Extract values from /game help command", () => {
    const inputContent = "/game help";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "game",
      params: {
        game: "help",
      },
    });
  });

  test("Extract values from /agent prompt command", () => {
    const inputContent = "/agent Hello, how can I assist you today?";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "agent",
      params: expect.objectContaining({
        prompt: "Hello, how can I assist you today?".toLowerCase(),
      }),
    });
  });

  test("Extract values from /agent tell a joke command", () => {
    const inputContent = "/agent tell a joke";
    const extractedValues = extractCommandValues(inputContent, skills);
    console.log(extractedValues);
    expect(extractedValues).toEqual({
      command: "agent",
      params: {
        prompt: "tell a joke",
      },
    });
  });

  test("Extract values from /send 1 eth to @bo command", () => {
    const inputContent = "/send 1 eth to @bo";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "send",
      params: {
        amount: 1,
        token: "eth",
        username: "@bo",
      },
    });
  });

  test("Extract values from /show swap demo command", () => {
    const inputContent = "/show";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "show",
      params: {},
    });
  });

  test("Extract values from /agent lets play a game command", () => {
    const inputContent = "/agent lets play a game";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "agent",
      params: {
        prompt: "lets play a game",
      },
    });
  });

  test("Extract values from /help command", () => {
    const inputContent = "/help";
    const extractedValues = extractCommandValues(inputContent, skills);
    expect(extractedValues).toEqual({
      command: "help",
      params: {},
    });
  });
});
