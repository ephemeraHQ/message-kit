import "dotenv/config";
import { commands } from "./commands";
import { fakeUsers as users } from "../helpers/usernames";
import { extractCommandValues } from "../helpers/commands";

describe("Command extraction tests", () => {
  test("Extract values from /help2 command", () => {
    const inputContent = "/help2 hey";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "help2",
      params: expect.objectContaining({
        cmd: "hey",
      }),
    });
  });
  test("Extract values from /tip command", () => {
    const inputContent = "/tip @bo @alix 15";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "tip",
      params: {
        amount: 15,
        username: expect.arrayContaining([
          expect.objectContaining({
            username: "bo",
          }),
          expect.objectContaining({
            username: "alix",
          }),
        ]),
      },
    });
  });

  test("Extract values from /swap command", () => {
    const inputContent = "/swap 10 eth to usdc";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "swap",
      params: {
        amount: 10,
        token_from: "eth",
        token_to: "usdc",
      },
    });
  });

  test("Extract values from /mint command", () => {
    const inputContent = "/mint 0x73a333cb82862d4f66f0154229755b184fb4f5b0 1";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "mint",
      params: {
        collection: "0x73a333cb82862d4f66f0154229755b184fb4f5b0",
        tokenId: 1,
      },
    });
  });

  test("Extract values from /send command", () => {
    const inputContent = "/send 10 usdc @bo";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "send",
      params: {
        amount: 10,
        token: "usdc",
        username: expect.arrayContaining([
          expect.objectContaining({
            username: "bo",
          }),
        ]),
      },
    });
  });

  test("Extract values from /game command", () => {
    const inputContent = "/game slot";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "game",
      params: {
        game: "slot",
      },
    });
  });

  test("Extract values from /add command", () => {
    const inputContent = "/add @bo";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "add",
      params: expect.objectContaining({
        username: expect.arrayContaining([
          expect.objectContaining({
            username: "bo",
          }),
        ]),
      }),
    });
  });

  test("Extract values from /remove command", () => {
    const inputContent = "/remove @alix";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "remove",
      params: expect.objectContaining({
        username: expect.arrayContaining([
          expect.objectContaining({
            username: "alix",
          }),
        ]),
      }),
    });
  });

  test("Extract values from /name command", () => {
    const inputContent = '/name "New name"';
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "name",
      params: expect.objectContaining({
        name: "New name",
      }),
    });
  });

  test("Extract values from /agent prompt command", () => {
    const inputContent = "/agent Hello, how can I assist you today?";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "agent",
      params: expect.objectContaining({
        prompt: "Hello, how can I assist you today?",
      }),
    });
  });
});
