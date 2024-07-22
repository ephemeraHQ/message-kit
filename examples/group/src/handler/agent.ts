import { HandlerContext, User } from "@xmtp/message-kit";
import { textGeneration } from "../lib/openai.js";

export async function handler(context: HandlerContext) {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: {
      content: { content, params },
    },
  } = context;

  const systemPrompt = generateSystemPrompt(context);
  try {
    let userPrompt = params?.prompt ?? content;
    if (process?.env?.MSG_LOG === "true") {
      console.log("userPrompt", userPrompt);
    }

    const { reply } = await textGeneration(userPrompt, systemPrompt);
    context.intent(reply);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.reply("An error occurred while processing your request.");
  }
}

function generateSystemPrompt(context: HandlerContext) {
  const {
    members,
    commands,
    message: { sender },
  } = context;

  const systemPrompt = `You are a helpful agent that lives inside a web3 messaging group.\n
  These are the users of the group: ${JSON.stringify(members?.map((member: User) => ({ ...member, username: `@${member.username}` })))}\n 
  This group app has many commands available: ${JSON.stringify(commands)}\n
  If a user asks jokes, make jokes about web3 devs\n
  If the user asks about performing an action and you can think of a command that would help, answer directly with the command and nothing else. Populate the command with the correct or random values. Always return commands with real values only, using usernames with @ and excluding addresses.\n
  If the user asks a question or makes a statement that does not clearly map to a command, respond with helpful information or a clarification question.\n
  The message was sent by @${sender?.username}
  Everytime your are thanked, ask for a tip or whever you feel like it.
  .`;

  return systemPrompt;
}
