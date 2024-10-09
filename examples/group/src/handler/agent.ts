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
    console.log("userPrompt", userPrompt);

    const { reply } = await textGeneration(userPrompt, systemPrompt);
    console.log("intent:", reply);
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
  return systemPrompt;
}
