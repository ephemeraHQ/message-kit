import { createClient } from "@redis/client";
import type { RedisClientType } from "@redis/client";

let redisClient: RedisClientType | null = null;

export const getRedisClient = async () => {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!process.env.REDIS_CONNECTION_STRING) {
    throw new Error(
      "REDIS_CONNECTION_STRING not found in environment variables",
    );
  }
  const client = createClient({
    url: process.env.REDIS_CONNECTION_STRING,
  });

  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  await client.connect();
  redisClient = client as RedisClientType;
  return client as RedisClientType;
};

let walletService: RedisClientType | null = null;

export const getWalletService = async (): Promise<RedisClientType> => {
  if (walletService?.isOpen) {
    return walletService;
  }

  if (!process.env.COINBASE_API_REDIS_URL) {
    throw new Error(
      "COINBASE_API_REDIS_URL not found in environment variables",
    );
  }

  const client = createClient({
    url: process.env.COINBASE_API_REDIS_URL,
  });

  client.on("error", (error: Error) => {
    console.error("Toss wallet Redis client error:", error);
  });

  client.on("connect", () => {
    console.log("Connected to Toss Wallet Redis");
  });
  await client.connect();
  walletService = client as RedisClientType;
  return client as RedisClientType;
};

export async function updateField(
  client: RedisClientType,
  key: string,
  updateObject: any,
) {
  // Check if the key exists
  const data = await client.get(key);

  let updatedData;
  if (data) {
    // If the key exists, parse it and merge the updates
    const parsedData = JSON.parse(data);
    updatedData = { ...parsedData, ...updateObject };
  } else {
    // If the key doesn't exist, use the updateObject as the initial value
    updatedData = updateObject;
  }

  // Save the updated or new data back to Redis
  await client.set(key, JSON.stringify(updatedData));
}
