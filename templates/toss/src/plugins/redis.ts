import { createClient } from "@redis/client";
import { RedisClientType } from "@redis/client";

export const getRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_CONNECTION_STRING,
  });

  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  await client.connect();
  return client as RedisClientType;
};
