import "dotenv/config";
import { run, HandlerContext, xmtpClient } from "@xmtp/botkit";
import { users } from "./lib/users.js";
import { handler as baseHandler } from "./bots/baseframe.js";
import { commands } from "./commands.js";
import { handler as basebetHandler } from "./bots/basebet.js";
import { handler as degenHandler } from "./bots/degen.js";
import { handler as gptHandler } from "./bots/gpt.js";
import { handler as gamesHandler } from "./bots/games.js";
import { handler as generalHandler } from "./bots/general.js";
import { handler as commandHandler } from "./bots/cmd.js";

const newBotConfig = {
  context: {
    commands: commands,
    users: users,
  },
};

run(async (context: HandlerContext) => {
  const { content, typeId, senderAddress } = context.message;
  console.log(content);
  populateFakeUsers(context);
  if (typeId == "reaction") {
    const { action, content: emoji } = content;
    if (emoji == "degen" && action == "added") await degenHandler(context);
  } else if (typeId == "reply") {
    const { receiver, content: reply } = content;
    if (receiver && reply.includes("degen")) await degenHandler(context);
  } else if (typeId == "text") {
    const { content: text } = content;
    if (text.startsWith("@bot")) {
      await gptHandler(context, commands);
    } else if (text.startsWith("/cmd")) {
      await commandHandler(context);
    } else if (text.startsWith("/bet")) {
      await basebetHandler(context);
    } else if (
      text.startsWith("/send") ||
      text.startsWith("/swap") ||
      text.startsWith("/mint") ||
      text.startsWith("/show")
    ) {
      await baseHandler(context);
    } else if (text.startsWith("/tip")) {
      await degenHandler(context);
    } else if (text.startsWith("/game")) {
      await gamesHandler(context);
    } else if (text.startsWith("/")) {
      await generalHandler(context);
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
