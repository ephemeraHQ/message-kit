import { run, HandlerContext } from "@xmtp/message-kit";
import { handler as tipping } from "./handler/tipping.js";
import { handler as agent } from "./handler/agent.js";
import { handler as transaction } from "./handler/transaction.js";
import { handler as splitpayment } from "./handler/payment.js";
import { handler as games } from "./handler/game.js";
import { handler as admin } from "./handler/admin.js";
import { handler as loyalty } from "./handler/loyalty.js";

// Main function to run the app
run(async (context: HandlerContext) => {
  const {
    message: { typeId },
  } = context;
  try {
    switch (typeId) {
      case "reaction":
        handleReaction(context);
        loyalty(context);
        break;
      case "reply":
        handleReply(context);
        break;
      case "group_updated":
        admin(context);
        loyalty(context);
        break;
      case "remoteStaticAttachment":
        handleAttachment(context);
        break;
      case "text":
        handleTextMessage(context);
        loyalty(context, true);
        break;
      default:
        console.warn(`Unhandled message type: ${typeId}`);
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
});

// Handle reaction messages
async function handleReaction(context: HandlerContext) {
  const {
    content: { content: emoji, action },
  } = context.message;

  if (action === "added" && (emoji === "degen" || emoji === "🎩")) {
    await tipping(context);
  }
}

// Handle reply messages
async function handleReply(context: HandlerContext) {
  const {
    content: { content: reply },
  } = context.message;
  if (reply.includes("degen")) {
    await tipping(context);
  }
}

// Handle attachment messages
async function handleAttachment(context: HandlerContext) {
  await splitpayment(context);
}

// Handle text messages
async function handleTextMessage(context: HandlerContext) {
  const {
    content: { content: text },
  } = context.message;
  if (text.includes("/help")) {
    await helpHandler(context);
  } else if (text.startsWith("@agent")) {
    await agent(context);
  }
  await context.intent(text);
}

async function helpHandler(context: HandlerContext) {
  const { commands = [] } = context;
  const intro =
    "Available experiences:\n" +
    commands
      .flatMap((app) => app.commands)
      .map((command) => `${command.command} - ${command.description}`)
      .join("\n") +
    "\nUse these commands to interact with specific apps.";
  context.send(intro);
}
