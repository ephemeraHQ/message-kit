import { run, HandlerContext } from "@xmtp/message-kit";
import { handler as tipping } from "./handler/tipping.js";
import { handler as agent } from "./handler/agent.js";
import { handler as splitpayment } from "./handler/splitpayment.js";

// Main function to run the app
run(async (context: HandlerContext) => {
  const {
    message: { typeId },
  } = context;
  switch (typeId) {
    case "reaction":
      handleReaction(context);
      break;
    case "reply":
      handleReply(context);
      break;
    case "remoteStaticAttachment":
      handleAttachment(context);
      break;
    case "text":
      handleTextMessage(context);
      break;
  }
});
async function handleReply(context: HandlerContext) {
  const {
    v2client,
    getReplyChain,
    version,
    message: {
      content: { reference },
    },
  } = context;

  const { chain, isSenderInChain } = await getReplyChain(
    reference,
    version,
    v2client.address,
  );
  console.log(chain);
  handleTextMessage(context);
}
// Handle reaction messages
async function handleReaction(context: HandlerContext) {
  const {
    v2client,
    getReplyChain,
    version,
    message: {
      content: { content: emoji, action, reference },
    },
  } = context;

  const { chain, isSenderInChain } = await getReplyChain(
    reference,
    version,
    v2client.address,
  );
  console.log(chain);

  if (action === "added" && (emoji === "degen" || emoji === "🎩")) {
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
  } else await context.intent(text);
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
