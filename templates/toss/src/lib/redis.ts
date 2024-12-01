import { createClient } from "@redis/client";
import type { RedisClientType } from "@redis/client";

let userWalletClient: RedisClientType | null = null;
let tossWalletClient: RedisClientType | null = null;
let tossDBClient: RedisClientType | null = null;

export const getUserWalletRedis = async (): Promise<RedisClientType> => {
  if (userWalletClient?.isOpen) {
    return userWalletClient;
  }

  if (!process.env.USER_WALLET_REDIS_URL) {
    throw new Error("USER_WALLET_REDIS_URL not found in environment variables");
  }

  const client = createClient({
    url: process.env.USER_WALLET_REDIS_URL,
  });

  client.on("error", (error: Error) => {
    console.error("User wallet Redis client error:", error);
  });

  client.on("connect", () => {
    console.log("Connected to User Wallet Redis");
  });

  await client.connect();
  userWalletClient = client as RedisClientType;
  return client as RedisClientType;
};

export const getTossWalletRedis = async (): Promise<RedisClientType> => {
  if (tossWalletClient?.isOpen) {
    return tossWalletClient;
  }

  if (!process.env.TOSS_WALLET_REDIS_URL) {
    throw new Error("TOSS_WALLET_REDIS_URL not found in environment variables");
  }

  const client = createClient({
    url: process.env.TOSS_WALLET_REDIS_URL,
  });

  client.on("error", (error: Error) => {
    console.error("Toss wallet Redis client error:", error);
  });

  client.on("connect", () => {
    console.log("Connected to Toss Wallet Redis");
  });
  await client.connect();
  tossWalletClient = client as RedisClientType;
  return client as RedisClientType;
};

export const getTossDBClient = async (): Promise<RedisClientType> => {
  if (tossDBClient?.isOpen) {
    return tossDBClient;
  }

  if (!process.env.TOSS_DB_REDIS_URL) {
    throw new Error("TOSS_DB_REDIS_URL not found in environment variables");
  }

  const client = createClient({
    url: process.env.TOSS_DB_REDIS_URL,
  });

  client.on("error", (error: Error) => {
    console.error("General Redis client error:", error);
  });

  client.on("connect", () => {
    console.log("Connected to Toss DB Redis");
  });
  await client.connect();
  tossDBClient = client as RedisClientType;
  return client as RedisClientType;
};

// Cleanup function
export const closeRedisConnections = async () => {
  if (userWalletClient?.isOpen) await userWalletClient.quit();
  if (tossWalletClient?.isOpen) await tossWalletClient.quit();
  if (tossDBClient?.isOpen) await tossDBClient.quit();

  userWalletClient = null;
  tossWalletClient = null;
  tossDBClient = null;
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
