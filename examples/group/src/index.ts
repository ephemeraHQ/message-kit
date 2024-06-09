import "dotenv/config";
import { run, HandlerContext } from "@xmtp/botkit";
import { users } from "./lib/users.js";
import { handler as baseHandler } from "./handler/frame.js";
import { commands } from "./commands.js";
import { handler as bet } from "./handler/bet.js";
import { handler as tipping } from "./handler/tipping.js";
import { handler as gpt } from "./handler/gpt.js";
import { handler as games } from "./handler/games.js";
import { handler as general } from "./handler/general.js";

const newBotConfig = {
  context: {
    commands: commands,
    users: users,
  },
};

run(async (context: HandlerContext) => {
  const { content, typeId, senderAddress } = context.message;
  populateFakeUsers(context);
  if (typeId == "reaction") {
    const { action, content: emoji } = content;
    if (emoji == "degen" && action == "added") await tipping(context);
  } else if (typeId == "reply") {
    const { receiver, content: reply } = content;
    if (receiver && reply.includes("degen")) await tipping(context);
  } else if (typeId == "text") {
    const { content: text } = content;
    if (text.startsWith("/tip")) {
      await tipping(context);
    } else if (text.startsWith("@bot")) {
      await gpt(context, commands);
    } else if (text.startsWith("/bet")) {
      await bet(context);
    } else if (
      text.startsWith("/send") ||
      text.startsWith("/swap") ||
      text.startsWith("/mint") ||
      text.startsWith("/show")
    ) {
      await baseHandler(context);
    } else if (text.startsWith("/game")) {
      await games(context);
    } else if (text.startsWith("/")) {
      await general(context);
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
