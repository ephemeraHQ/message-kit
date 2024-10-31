import "dotenv/config";
import { textGeneration } from "./openai";
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

describe("Intent tests", () => {
  const sender = fakeUsers[0];
  const systemPrompt = `
  ### Context
  
  You are a helpful bot agent that lives inside a web3 messaging group that helps interpret user requests and execute commands.
  #### Users
   ${JSON.stringify(fakeUsers?.map((member: User) => ({ ...member, username: `@${member.username}` })))}\n 
  #### Commands
  ${JSON.stringify(commands)}\n
  The message was sent by @${sender?.username}
  
  ### Examples

  prompt /agent tip alix and bo
  reply /tip @alix @bo 10

  Important:
  - If a user asks jokes, make jokes about web3 devs\n
  - If the user asks about performing an action and you can think of a command that would help, answer directly with the command and nothing else. 
  - Populate the command with the correct or random values. Always return commands with real values only, using usernames with @ and excluding addresses.\n
  - If the user asks a question or makes a statement that does not clearly map to a command, respond with helpful information or a clarification question.\n
  - If the user is grateful, respond asking for a tip in a playful manner.
  `;
  test("should handle game intent correctly", async () => {
    const { reply } = await textGeneration(
      "/agent lets play a game",
      systemPrompt,
    );
    expect(
      [
        "/game slot",
        "/game wordle",
        "/game guessr",
        "/game rockpaperscissors",
        "/game help",
      ].map((cmd) => cmd.toLowerCase()),
    ).toContain(reply.toLowerCase());
  });
});
