import "dotenv/config";
import { textGeneration } from "./lib/openai";
import { skills } from "./Test_skills";
import { AbstractedMember } from "../helpers/types";

describe("Skill tests", () => {
  const sender: AbstractedMember = {
    address: "0x3a044b218BaE80E5b9E16609443A192129A67BeA",
    inboxId: "da3750159ea7541dda1e271076a3663d8c14576ab85bbd3416d45c9f19e35cbc",
    accountAddresses: ["0x3a044b218BaE80E5b9E16609443A192129A67BeA"],
  };
  const members: AbstractedMember[] = [sender];

  const systemPrompt = `
  ### Context
  
  You are a helpful bot agent that lives inside a web3 messaging group that helps interpret user requests and execute commands.
  #### Users
   ${JSON.stringify(members)}\n 
  #### Commands
  ${JSON.stringify(skills)}\n
  The message was sent by @${sender?.address}
  
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
  test("should handle game skill correctly", async () => {
    const { reply } = await textGeneration(
      sender.address,
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
