import { HandlerContext } from "@xmtp/botkit";
import { commands } from "../commands.js"; // Assuming commands.ts is in the same directory

export async function handler(context: HandlerContext) {
  const { content } = context.message;
  const { content: text, params } = content;
  console.log(params);
  if (text.startsWith("/tx")) {
    context.reply("Send 1 ETH tx:0xf0490b45884803924Ca84C2051ef435991D7350D");
  } else if (text.startsWith("/dm")) {
    context.reply("dm:/0x1CB3649469546D10b7fa4fd1d1c63e8aA3a0E667");
  } else if (text.startsWith("/block")) {
    context.reply("❌ you are not an admin");
  } else if (text.startsWith("/unblock")) {
    context.reply("❌ you are not an admin");
  } else if (text.startsWith("/help")) {
    const intro =
      "Available experiences:\n" +
      commands
        .flatMap((bot: any) => bot.commands)
        .map((command: any) => `${command.command} - ${command.description}`)
        .join("\n") +
      "\nUse these commands to interact with specific bots.";
    context.reply(intro);
  } else {
    context.reply("Command not found. Use /help to see available commands.");
  }
}
