import "dotenv/config";
import { run, HandlerContext } from "@xmtp/message-kit";
import { commands } from "./commands.js";
import { handler as bet } from "./handler/betting.js";
import { handler as tipping } from "./handler/tipping.js";
import { handler as gpt } from "./handler/gpt.js";
import { handler as frame } from "./handler/frame.js";
import { handler as games } from "./handler/game.js";
import { handler as admin } from "./handler/admin.js";

const appConfig = {
  commands: commands,
};

// Main function to run the app
run(async (context: HandlerContext) => {
  const { content, typeId } = context.message;
  switch (typeId) {
    case "reaction":
      const { action, content: emoji } = content;
      if ((emoji == "degen" || emoji == "🎩") && action == "added") {
        await tipping(context);
      }
      break;
    case "reply":
      const { content: reply } = content;
      if (reply.includes("$degen")) {
        await tipping(context);
      }
      break;
    case "group_updated":
      await admin(context);
      break;
    case "text":
      const { content: text } = content;
      if (text.startsWith("/tip")) {
        await tipping(context);
      } else if (text.startsWith("@bot")) {
        await gpt(context);
      } else if (text.startsWith("/bet")) {
        await bet(context);
      } else if (
        text.startsWith("/send") ||
        text.startsWith("/swap") ||
        text.startsWith("/mint") ||
        text.startsWith("/show")
      ) {
        await frame(context);
      } else if (text.startsWith("/game")) {
        await games(context);
      } else if (text.startsWith("/admin")) {
        console.log(text);
        await admin(context);
      } else if (text === "/help") {
        const intro =
          "Available experiences:\n" +
          commands
            .flatMap((app) => app.commands)
            .map((command) => `${command.command} - ${command.description}`)
            .join("\n") +
          "\nUse these commands to interact with specific apps.";
        context.reply(intro);
      }
  }
}, appConfig);
