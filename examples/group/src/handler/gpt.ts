import { HandlerContext } from "message-kit";
import openaiCall from "../lib/gpt.js";

export async function handler(context: HandlerContext) {
  if (!process.env.OPEN_AI_API_KEY) {
    return context.reply("No OpenAI API key found");
  }
  const {
    members,
    commands,
    message: {
      content: { content: text },
      sender,
    },
  } = context;

  const systemPrompt = `You are a helpful assistant that lives inside a web3 messaging group.\n
  These are the users of the group:${JSON.stringify(members)}\n 
  This group app has many commands avaiable: ${JSON.stringify(commands)}\n
  When possible, answer with the command from the list for the user to perform. put this command in a new line\n
  The message was sent by ${sender?.username}`;
  let message = text.replace("@bot", "");

  let { reply } = await openaiCall(message, sender.inboxId, systemPrompt);

  await context.reply(`${reply}`);
}
