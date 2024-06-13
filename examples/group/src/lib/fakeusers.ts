import { HandlerContext } from "@xmtp/mkit";
import openaiCall from "./gpt.js";

export async function handler(context: HandlerContext) {
  const { users, commands } = context.context;
  const { content, senderAddress } = context.message;
  const { content: text } = content;
  const systemPrompt = `You love blockchain and decentralization and you are quite funny. You often tell crypto jokes\n
  You are inside a group chat. Send messages based on what users say. You are not an assistant you are just a group member\n
  You know everyone in this group ${JSON.stringify(users)}\n
  You know every command of this group ${JSON.stringify(commands)}\n
  The message was sent by ${senderAddress}`;

  let { reply } = await openaiCall(text, senderAddress, systemPrompt);

  await context.textReply(reply);
}
