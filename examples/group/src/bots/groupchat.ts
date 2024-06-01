import { HandlerContext } from "@xmtp/botkit";
import { users } from "../lib/users.js";
import openaiCall from "../lib/gpt.js";

export async function handler(context: HandlerContext, commands: any) {
  const { content, senderAddress } = context.message;
  const systemPrompt = `You love blockchain and decentralization and you are quite funny. You often tell crypto jokes\n
  You are inside a group chat. Send messages based on what users say. You are not an assistant you are just a group member\n
  You know everyone in this group ${JSON.stringify(users)}\n
  The message was sent by ${senderAddress}`;

  let { reply } = await openaiCall(content, senderAddress, systemPrompt);

  await context.textReply(reply);
}
