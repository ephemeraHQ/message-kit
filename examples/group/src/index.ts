import { run, HandlerContext, CommandHandlers } from "@xmtp/message-kit";
import { commands } from "./commands.js";
import { handler as bet } from "./handler/betting.js";
import { handler as tipping } from "./handler/tipping.js";
import { handler as agent } from "./handler/agent.js";
import { handler as transaction } from "./handler/transaction.js";
import { handler as splitpayment } from "./handler/payment.js";
import { handler as games } from "./handler/game.js";
import { handler as admin } from "./handler/admin.js";
import { handler as loyalty } from "./handler/loyalty.js";

// Define command handlers
const commandHandlers: CommandHandlers = {
  "/tip": tipping,
  "/agent": agent,
  "/bet": bet,
  "/send": transaction,
  "/swap": transaction,
  "/mint": transaction,
  "/show": transaction,
  "/points": loyalty,
  "/leaderboard": loyalty,
  "/game": games,
  "/add": admin,
  "/remove": admin,
  "/name": admin,
  "/help": async (context: HandlerContext) => {
    const intro =
      "Available experiences:\n" +
      commands
        .flatMap((app) => app.commands)
        .map((command) => `${command.command} - ${command.description}`)
        .join("\n") +
      "\nUse these commands to interact with specific apps.";
    context.send(intro);
  },
  "/apps": async (context: HandlerContext) => {
    const intro =
      "Decentralized secure messaging. Built for crypto.\n" +
      "Welcome to the Apps Directory\n\n" +
      "- 💧 faucetbot.eth : Delivers Faucet funds to devs on Testnet\n\n\n" +
      "- 🛍️ thegeneralstore.eth : Simple ecommerce storefront for hackathon goods\n\n\n" +
      "- 📅 wordlebot.eth : Play daily to the WORDLE game through messaging.\n\n\n" +
      "- 🪨 mintframe - 0xB7d51dD8331551D2FA0d185F8Ba08DcCd71499aD : Turn a Zora url into a mint frame.\n\n\n" +
      "To learn how to build your own app, visit MessageKit: https://message-kit.vercel.app/\n\n" +
      "To publish your app, visit Directory: https://message-kit.vercel.app/directory\n\n" +
      "You are currently inside Message Kit Group Starter. You can type:\n/help command to see available commands\n/apps to trigger the directory.";

    context.reply(intro);
  },
};

// App configuration
const appConfig = {
  commands: commands,
  commandHandlers: commandHandlers,
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
  if (text.includes("@bot")) {
    await agent(context);
  } else if (text.startsWith("/")) {
    await context.intent(text);
  }
}
