import "dotenv/config";
import { run, HandlerContext } from "@xmtp/botkit";

//Tracks conversation steps
const inMemoryCacheStep = new Map<string, number>();

run(async (context: HandlerContext) => {
  const { content, senderAddress } = context.message;
  const lowerContent = content.toLowerCase();

  //Handles unsubscribe and resets step
  const stopWords = ["stop", "unsubscribe", "cancel", "list"];
  if (stopWords.some((word) => lowerContent.includes(word))) {
    inMemoryCacheStep.set(senderAddress, 0);
    await context.reply(
      "You are now unsubscribed. You will no longer receive updates!.",
    );
  }

  const cacheStep = inMemoryCacheStep.get(senderAddress) || 0;
  let message = "";
  if (cacheStep === 0) {
    message = "Welcome! Choose an option:\n1. Info\n2. Subscribe";
    // Move to the next step
    inMemoryCacheStep.set(senderAddress, cacheStep + 1);
  } else if (cacheStep === 1) {
    if (content === "1") {
      message = "Here is the info.";
    } else if (content === "2") {
      message =
        "You are now subscribed. You will receive updates.\n\ntype 'stop' to unsubscribe";
      //reset the bot to the initial step
      inMemoryCacheStep.set(senderAddress, 0);
    } else {
      message = "Invalid option. Please choose 1 for Info or 2 to Subscribe.";
      // Keep the same step to allow for re-entry
    }
  } else {
    message = "Invalid option. Please start again.";
    inMemoryCacheStep.set(senderAddress, 0);
  }

  //Send the message
  await context.reply(message);
});
