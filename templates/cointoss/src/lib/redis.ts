import { createClient } from "@redis/client";
import type { RedisClientType } from "@redis/client";

let userWalletClient: RedisClientType | null = null;
let tossWalletClient: RedisClientType | null = null;
let generalClient: RedisClientType | null = null;

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

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (generalClient?.isOpen) {
    return generalClient;
  }

  if (!process.env.REDIS_CONNECTION_STRING) {
    throw new Error(
      "REDIS_CONNECTION_STRING not found in environment variables",
    );
  }

  const client = createClient({
    url: process.env.REDIS_CONNECTION_STRING,
  });

  client.on("error", (error: Error) => {
    console.error("General Redis client error:", error);
  });

  client.on("connect", () => {
    console.log("Connected to General Redis");
  });
  await client.connect();
  generalClient = client as RedisClientType;
  return client as RedisClientType;
};

// Cleanup function
export const closeRedisConnections = async () => {
  if (userWalletClient?.isOpen) await userWalletClient.quit();
  if (tossWalletClient?.isOpen) await tossWalletClient.quit();
  if (generalClient?.isOpen) await generalClient.quit();

  userWalletClient = null;
  tossWalletClient = null;
  generalClient = null;
};
