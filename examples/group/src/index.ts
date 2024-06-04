import "dotenv/config";
import { run, HandlerContext, xmtpClient } from "@xmtp/botkit";
import { users } from "./lib/users.js";
import { handler as baseHandler } from "./bots/baseframe.js";
import { commands } from "./commands.js";
import { handler as basebetHandler } from "./bots/basebet.js";
import { handler as degenHandler } from "./bots/degen.js";
import { handler as gptHandler } from "./bots/gpt.js";
import { handler as gamesHandler } from "./bots/games.js";
import { handler as groupChatHandler } from "./bots/groupchat.js";

const newBotConfig = {
  context: {
    commands: commands,
    users: users,
  },
};

run(async (context: HandlerContext) => {
  const { content, contentType, senderAddress } = context.message;
  const { typeId } = contentType;

  populateFakeUsers(context);
  if (typeId == "reaction") {
    const { action, content: emoji } = content;
    if (emoji == "degen" && action == "added") await degenHandler(context);
  } else if (typeId == "reply") {
    const { receiver, content: reply } = content;
    if (receiver && reply.includes("degen")) await degenHandler(context);
  } else if (typeId == "text") {
    if (content.startsWith("@bot")) {
      await gptHandler(context, commands);
    } else if (content.startsWith("/basebet")) {
      await basebetHandler(context);
    } else if (content.startsWith("/base")) {
      await baseHandler(context);
    } else if (content.startsWith("/tx")) {
      context.reply("Send 1 ETH tx:0xf0490b45884803924Ca84C2051ef435991D7350D");
    } else if (content.startsWith("/dm")) {
      context.reply("dm:/0x1CB3649469546D10b7fa4fd1d1c63e8aA3a0E667");
    } else if (content.startsWith("/tip")) {
      await degenHandler(context);
    } else if (content.startsWith("/games")) {
      await gamesHandler(context);
    } else if (content.startsWith("/help")) {
      const intro =
        "Available experiences:\n" +
        commands
          .flatMap((bot: any) => bot.commands)
          .map((command: any) => `${command.command} - ${command.description}`)
          .join("\n") +
        "\nUse these commands to interact with specific bots.";
      context.reply(intro);
    } else if (content.startsWith("/block") || content.startsWith("/unblock")) {
      context.reply("❌ you are not an admin");
    } else if (content.startsWith("/")) {
      context.reply("Command not found. Use /help to see available commands.");
    } else {
      await groupChatHandler(context, commands);
    }
  }
}, newBotConfig);

const populateFakeUsers = async (context: HandlerContext) => {
  /*Fake groupchat*/
  const fabriIndex = users.findIndex((user) => user.username === "fabri");
  if (fabriIndex !== -1) {
    users[fabriIndex].address = context.message.senderAddress;
  }
  const botIndex = users.findIndex((user) => user.username === "bot");
  if (botIndex !== -1) {
    users[botIndex].address = context.clientAddress;
  }
};
