import { createClient } from "@redis/client";

export const getRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_CONNECTION_STRING,
  });
  await client.connect();
  return client;
};

/* To boost the efficiency of managing XMTP conversations, a caching mechanism is essential. Utilizing fs-persistence or Redis allows the system to swiftly verify the existence of a conversation, eliminating the need to reload and inspect every conversation. 
This method greatly accelerates both initial and subsequent requests, minimizing wait times and preventing timeouts.
For additional information on configuring fs-persistence with XMTP, please consult the fs-persistence documentation.
The need for this caching mechanism stems from the requirement to ascertain whether newConversation is continuing an existing conversation or starting a new one. This verification aids in avoiding duplicate conversations with the same user, ensuring compliance with privacy standards. */
export const getRedisConfig = async (redisClient: any) => {
  const redisPersistence = await import("@xmtp/redis-persistence");
  const newBotConfig = {
    basePersistance: new redisPersistence.RedisPersistence(
      redisClient as any,
      "xmtp:"
    ),
  };
  return newBotConfig;
};
