import cron from "node-cron";
import { Client } from "@xmtp/xmtp-js";
import {
  RedisClientType,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from "@redis/client";

export async function startCron(
  redisClient: RedisClientType<RedisModules, RedisFunctions, RedisScripts>,
  v2client: Client,
) {
  console.log("Starting daily cron");
  const conversations = await v2client.conversations.list();
  cron.schedule(
    "0 0 * * *", // Daily or every 5 seconds in debug mode
    async () => {
      const keys = await redisClient.keys("*");
      console.log(`Running daily task. ${keys.length} subscribers.`);
      for (const address of keys) {
        const subscriptionStatus = await redisClient.get(address);
        if (subscriptionStatus === "subscribed") {
          console.log(`Sending daily update to ${address}`);
          // Logic to send daily updates to each subscriber
          const targetConversation = conversations.find(
            (conv) => conv.peerAddress === address,
          );
          if (targetConversation)
            await targetConversation.send("Here is your daily update!");
        }
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    },
  );
}
