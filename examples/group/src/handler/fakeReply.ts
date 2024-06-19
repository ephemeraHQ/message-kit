import { MlsHandlerContext as HandlerContext } from "@xmtp/message-kit";
import openaiCall from "../lib/gpt.js";

export async function handler(context: HandlerContext) {
  const { members, commands } = context;
  const { content, sender } = context.message;
  const { content: text } = content;
  const systemPrompt = `You love blockchain and decentralization and you are quite funny. You often tell crypto jokes\n
  You are inside a group chat. Send messages based on what users say. You are not an assistant you are just a group member\n
  You know everyone in this group ${JSON.stringify(members)}\n
  You know every command of this group ${JSON.stringify(commands)}\n
  The message was sent by ${sender}`;

  let { reply } = await openaiCall(text, sender, systemPrompt);

  await context.reply(reply);
}
