import { MlsHandlerContext as HandlerContext } from "@xmtp/message-kit";
import openaiCall from "../lib/gpt.js";

export async function handler(context: HandlerContext) {
  const { members, commands } = context;
  const { content, sender } = context.message;
  const { content: text } = content;
  const systemPrompt = `You are a helpful assistant that lives inside a web3 messaging group.\n
  This are the users of the group:${JSON.stringify(members)}\n 
  This group app has many commands avaiable: ${JSON.stringify(commands)}\n
  When possible, answer with the command from the list for the user to perform. put this command in a new line\n
  The message was sent by ${sender}`;

  let message = text.replace("@bot", "");
  let { reply } = await openaiCall(message, sender, systemPrompt);

  await context.reply(`${reply}`);
}
