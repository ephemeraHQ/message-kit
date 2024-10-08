import "dotenv/config";
import { textGeneration } from "../helpers/openai";
import { commands } from "./commands";
import { fakeUsers as members } from "../helpers/usernames";
import { User } from "../helpers/types";

describe("Intent tests", () => {
  const sender = members[0];
  const systemPrompt = `
  ### Context
  
  You are a helpful bot agent that lives inside a web3 messaging group that helps interpret user requests and execute commands.
  #### Users
   ${JSON.stringify(members?.map((member: User) => ({ ...member, username: `@${member.username}` })))}\n 
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
