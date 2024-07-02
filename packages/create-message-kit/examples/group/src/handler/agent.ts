import { HandlerContext } from "@xmtp/message-kit";
import { textGeneration } from "../lib/openai.js";

export async function handler(context: HandlerContext) {
  if (!process.env.OPEN_AI_API_KEY) {
    return context.reply("No OpenAI API key found");
  }

  const {
    message: {
      content: { content: prompt },
    },
  } = context;

  const systemPrompt = generateSystemPrompt(context);
  try {
    let userPrompt = prompt.split(" ")[1];
    const { reply, history } = await textGeneration(userPrompt, systemPrompt);

    if (reply.startsWith("/")) {
      context.handleCommand(reply);
    } else {
      await context.reply(reply);
    }
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

  return `You are a helpful agent that lives inside a web3 messaging group.\n
  These are the users of the group: ${JSON.stringify(members?.map((member) => ({ ...member, username: `@${member.username}` })))}\n 
  This group app has many commands available: ${JSON.stringify(commands)}\n
  If the user asks about performing an action and you can think of a command that would help, answer directly with the command and nothing else. Populate the command with the correct or random values. Don't return it with placeholder values.\n
  If the user asks explicitly about commands, answer with the command from the list for the user to perform. Put this command in a new line.\n
  The message was sent by @${sender?.username}`;
}
