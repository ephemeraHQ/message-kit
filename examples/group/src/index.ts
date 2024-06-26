import {
  run,
  HandlerContext,
  AgentHandlers,
  CommandHandlers,
} from "message-kit";
import { commands } from "./commands.js";
import { handler as bet } from "./handler/betting.js";
import { handler as tipping } from "./handler/tipping.js";
import { handler as agent } from "./handler/agent.js";
import { handler as transaction } from "./handler/transaction.js";
import { handler as splitpayment } from "./handler/payment.js";
import { handler as games } from "./handler/game.js";
import { handler as admin } from "./handler/admin.js";

// Define command handlers
const commandHandlers: CommandHandlers = {
  "/tip": tipping,
  "/bet": bet,
  "/send": transaction,
  "/swap": transaction,
  "/mint": transaction,
  "/show": transaction,
  "/game": games,
  "/admin": admin,
  "/help": async (context: HandlerContext) => {
    const intro =
      "Available experiences:\n" +
      commands
        .flatMap((app) => app.commands)
        .map((command) => `${command.command} - ${command.description}`)
        .join("\n") +
      "\nUse these commands to interact with specific apps.";
    context.reply(intro);
  },
};

// Define agent handlers
const agentHandlers: AgentHandlers = {
  "@agent": agent,
};

// App configuration
const appConfig = {
  commands: commands,
  commandHandlers: commandHandlers,
  agentHandlers: agentHandlers,
};

// Main function to run the app
run(async (context: HandlerContext) => {
  const {
    message: { typeId },
  } = context;
  try {
    switch (typeId) {
      case "reaction":
        handleReaction(context);
        break;
      case "reply":
        handleReply(context);
        break;
      case "group_updated":
        await admin(context);
        break;
      case "remoteStaticAttachment":
        await handleAttachment(context);
        break;
      case "text":
        await handleTextMessage(context);
        break;
      default:
        console.warn(`Unhandled message type: ${typeId}`);
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
}, appConfig);

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

  if (reply.includes("$degen")) {
    await tipping(context);
  }
}

// Handle attachment messages
async function handleAttachment(context: HandlerContext) {
  const response = await splitpayment(context);
}

// Handle text messages
async function handleTextMessage(context: HandlerContext) {
  const {
    content: { content: text },
  } = context.message;
  if (text.startsWith("@")) {
    await context.handleAgent(text);
  } else if (text.startsWith("/")) {
    await context.handleCommand(text);
  } else {
    console.log(`Text message: ${text}`);
  }
}
