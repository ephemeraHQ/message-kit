import "dotenv/config";
import { extractCommandValues } from "../helpers/utils";
import type { CommandGroup } from "../helpers/types";
import { commands } from "./commands";
import { User } from "../helpers/types";

// Define a list of fake users with usernames and addresses
export const fakeUsers: User[] = [
  {
    username: "alix",
    address: "0x3a044b218BaE80E5b9E16609443A192129A67BeA",
    inboxId: "da3750159ea7541dda1e271076a3663d8c14576ab85bbd3416d45c9f19e35cbc",
    accountAddresses: ["0x3a044b218BaE80E5b9E16609443A192129A67BeA"],
    installationIds: [],
    fake: true,
  },
  {
    username: "eva",
    address: "0xeAc10D864802fCcfe897E3957776634D1AE006B2",
    inboxId: "6196afe3fd16c276113b0e4fc913745c39af337ea869fb49a2835201874de49c",
    accountAddresses: ["0xeAc10D864802fCcfe897E3957776634D1AE006B2"],
    installationIds: [],
    fake: true,
  },
  {
    username: "bo",
    address: "0xbc3246461ab5e1682baE48fa95172CDf0689201a",
    inboxId: "8d833f5419cbbfda027813e1fcd1db86c9ec320fd22fbe182883c47a7f34adc0",
    accountAddresses: ["0xbc3246461ab5e1682baE48fa95172CDf0689201a"],
    installationIds: [],
    fake: true,
  },
];

describe("Command extraction tests", () => {
  test("Extract values from /tip command", () => {
    const inputContent = "/tip @bo @alix 15";
    const extractedValues = extractCommandValues(
      inputContent,
      commands as CommandGroup[],
      fakeUsers,
    );
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
    const extractedValues = extractCommandValues(
      inputContent,
      commands as CommandGroup[],
      fakeUsers,
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
      commands as CommandGroup[],
      fakeUsers,
    );
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
    const extractedValues = extractCommandValues(
      inputContent,
      commands as CommandGroup[],
      fakeUsers,
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
      commands as CommandGroup[],
      fakeUsers,
    );
    expect(extractedValues).toEqual({
      command: "agent",
      params: expect.objectContaining({
        prompt: "Hello, how can I assist you today?",
      }),
    });
  });
});
