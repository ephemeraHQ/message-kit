import { getRedisClient, getRedisConfig } from "./lib/redis.js";
import cron from "node-cron";
import { ContentTypeText } from "@xmtp/content-type-text";
import { xmtpClient, run, HandlerContext } from "message-kit";

//Tracks conversation steps
const inMemoryCacheStep = new Map<string, number>();

//List of words to stop or unsubscribe.
const stopWords = ["stop", "unsubscribe", "cancel", "list"];
async function start() {
  const redisClient = await getRedisClient();

  const appConfig = {
    client: await getRedisConfig(redisClient), // Send it at the apptm of the run function
  };

  run(
    async (context: HandlerContext) => {
      const {
        message: {
          content: { content: text },
          typeId,
          sender: { address: senderAddress },
        },
      } = context;

      if (typeId !== "text") {
        /* If the input is not text do nothing */
        return;
      }

      const lowerContent = text?.toLowerCase();

      //Handles unsubscribe and resets step
      if (stopWords.some((word) => lowerContent.includes(word))) {
        inMemoryCacheStep.set(senderAddress, 0);
        await redisClient.del(senderAddress);
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
        if (text === "1") {
          message = "Here is the info.";
        } else if (text === "2") {
          await redisClient.set(senderAddress, "subscribed"); //test
          message =
            "You are now subscribed. You will receive updates.\n\ntype 'stop' to unsubscribe";
          //reset the app to the initial step
          inMemoryCacheStep.set(senderAddress, 0);
        } else {
          message =
            "Invalid option. Please choose 1 for Info or 2 to Subscribe.";
          // Keep the same step to allow for re-entry
        }
      } else {
        message = "Invalid option. Please start again.";
        inMemoryCacheStep.set(senderAddress, 0);
      }

      //Send the message
      await context.reply(message);
    }, //@ts-ignore
    appConfig,
  );

  // Daily task
  cron.schedule(
    "0 0 * * *", // Daily or every 5 seconds in debug mode
    async () => {
      const redisClient = await getRedisClient();
      const keys = await redisClient.keys("*");
      console.log(`Running daily task. ${keys.length} subscribers.`);
      for (const address of keys) {
        const subscriptionStatus = await redisClient.get(address);
        if (subscriptionStatus === "subscribed") {
          console.log(`Sending daily update to ${address}`);
          // Logic to send daily updates to each subscriber
          const client = await xmtpClient();
          const conversation = await client?.conversations.newConversation([
            address,
          ]);
          await conversation.send(
            "Here is your daily update!",
            ContentTypeText,
          );
        }
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    },
  );
}

start();
