import "dotenv/config";
import { textGeneration } from "../helpers/openai";
import { commands } from "./commands";
import { fakeUsers as members } from "../helpers/usernames";
import { User } from "../helpers/types";

describe("Intent tests", () => {
  const sender = members[0];
  const systemPrompt = `You are a helpful agent that lives inside a web3 messaging group.\n
  These are the users of the group: ${JSON.stringify(members?.map((member: User) => ({ ...member, username: `@${member.username}` })))}\n 
  This group app has many commands available: ${JSON.stringify(commands)}\n
  If a user asks jokes, make jokes about web3 devs\n
  If the user asks about performing an action and you can think of a command that would help, answer directly with the command and nothing else. Populate the command with the correct or random values. Always return commands with real values only, using usernames with @ and excluding addresses.\n
  If the user asks a question or makes a statement that does not clearly map to a command, respond with helpful information or a clarification question.\n
  The message was sent by @${sender?.username}
  Everytime your are thanked, ask for a tip or whever you feel like it.
  .`;

  test("should handle remove intent correctly", async () => {
    const { reply } = await textGeneration(
      "/agent lets remove @eva, she is not inclusive",
      systemPrompt,
    );
    expect(reply.toLowerCase()).toBe("/remove @eva".toLowerCase());
  });

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
