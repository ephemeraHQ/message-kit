import { createClient } from "@redis/client";
import type { RedisClientType } from "@redis/client";

let redisClient: RedisClientType | undefined = undefined;

export const getRedisClient = async () => {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!process.env.REDIS_CONNECTION_STRING) {
    throw new Error(
      "REDIS_CONNECTION_STRING not found in environment variables",
    );
  }
  
  console.log("Connecting to Redis...");
  const client = createClient({
    url: process.env.REDIS_CONNECTION_STRING,
  });

  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  client.on("connect", () => {
    console.log("Connected to Redis successfully");
  });

  await client.connect();
  redisClient = client as RedisClientType;
  return client as RedisClientType;
};

export async function updateField(
  client: RedisClientType,
  key: string,
  updateObject: any,
) {
  try {
    console.log(`Updating Redis field: ${key}`);
    // Check if the key exists
    const data = await client.get(key);

    let updatedData;
    if (data) {
      // If the key exists, parse it and merge the updates
      const parsedData = JSON.parse(data);
      updatedData = { ...parsedData, ...updateObject };
      console.log(`Updated existing data for ${key}`);
    } else {
      // If the key doesn't exist, use the updateObject as the initial value
      updatedData = updateObject;
      console.log(`Created new data for ${key}`);
    }

    // Save the updated or new data back to Redis
    await client.set(key, JSON.stringify(updatedData));
    console.log(`Successfully saved data for ${key}`);
  } catch (error) {
    console.error(`Error updating field in Redis for ${key}:`, error);
    throw error;
  }
}

export async function getAllEmployees(ownerAddress: string) {
  console.log(`Fetching all employees for owner: ${ownerAddress}`);
  const client = await getRedisClient();
  const keys = await client.keys(`employee:${ownerAddress}:*`);
  console.log(`Found ${keys.length} employee records`);
  
  const employees = [];

  for (const key of keys) {
    const data = await client.get(key);
    if (data) {
      employees.push(JSON.parse(data));
    }
  }

  return employees;
}

export async function removeEmployee(ownerAddress: string, employeeAddress: string) {
  console.log(`Removing employee ${employeeAddress} for owner ${ownerAddress}`);
  const client = await getRedisClient();
  const key = `employee:${ownerAddress}:${employeeAddress}`;
  await client.del(key);
  console.log(`Successfully removed employee record`);
} 