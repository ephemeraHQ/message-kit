import { getRedisClient } from "./lib/redis.js";
import { run, HandlerContext } from "@xmtp/message-kit";
import { startCron } from "./lib/cron.js";
import {
  RedisClientType,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from "@redis/client";

//Tracks conversation steps
const inMemoryCacheStep = new Map<string, number>();

//List of words to stop or unsubscribe.
const stopWords = ["stop", "unsubscribe", "cancel", "list"];

const redisClient: RedisClientType<RedisModules, RedisFunctions, RedisScripts> =
  await getRedisClient();

let clientInitialized = false;
run(async (context: HandlerContext) => {
  const {
    v2client,
    message: {
      content: { content: text },
      typeId,
      sender,
    },
  } = context;

  if (!clientInitialized) {
    startCron(redisClient, v2client);
    clientInitialized = true;
  }
  if (typeId !== "text") {
    /* If the input is not text do nothing */
    return;
  }

  const lowerContent = text?.toLowerCase();

  //Handles unsubscribe and resets step
  if (stopWords.some((word) => lowerContent.includes(word))) {
    inMemoryCacheStep.set(sender.address, 0);
    await redisClient.del(sender.address);
    await context.reply(
      "You are now unsubscribed. You will no longer receive updates!.",
    );
  }

  const cacheStep = inMemoryCacheStep.get(sender.address) || 0;
  let message = "";
  if (cacheStep === 0) {
    message = "Welcome! Choose an option:\n1. Info\n2. Subscribe";
    // Move to the next step
    inMemoryCacheStep.set(sender.address, cacheStep + 1);
  } else if (cacheStep === 1) {
    if (text === "1") {
      message = "Here is the info.";
    } else if (text === "2") {
      await redisClient.set(sender.address, "subscribed"); //test
      message =
        "You are now subscribed. You will receive updates.\n\ntype 'stop' to unsubscribe";
      //reset the app to the initial step
      inMemoryCacheStep.set(sender.address, 0);
    } else {
      message = "Invalid option. Please choose 1 for Info or 2 to Subscribe.";
      // Keep the same step to allow for re-entry
    }
  } else {
    message = "Invalid option. Please start again.";
    inMemoryCacheStep.set(sender.address, 0);
  }

  //Send the message
  await context.reply(message);
});
