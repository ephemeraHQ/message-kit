import "dotenv/config";
import { run, HandlerContext } from "@xmtp/message-kit";
import { commands } from "./commands.js";
import { handler as bet } from "./handler/bet.js";
import { handler as tipping } from "./handler/tipping.js";
import { handler as gpt } from "./handler/gpt.js";
import { handler as frame } from "./handler/frame.js";
import { handler as games } from "./handler/game.js";
import { handler as admin } from "./handler/admin.js";
import { handler as other } from "./handler/other.js";
import { handler as fakeusers } from "./lib/fakeusers.js";

// Configuration object for the app
const appConfig = {
  context: {
    commands: commands,
  },
};

// Main function to run the app
run(async (context: HandlerContext) => {
  const { content, typeId, senderAddress } = context.message;
  // Handling different types of messages
  switch (typeId) {
    case "reaction":
      const { action, content: emoji } = content;
      if (emoji == "🎩" && action == "added") {
        await tipping(context);
      }
      break;
    case "reply":
      const { receiver, content: reply } = content;
      if (receiver && reply.includes("$degen")) {
        await tipping(context);
      }
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
      } else if (text.startsWith("/block") || text.startsWith("/unblock")) {
        await admin(context);
      } else if (text.startsWith("/")) {
        await other(context);
      } else {
        await fakeusers(context);
      }
      break;
  }
}, appConfig);
