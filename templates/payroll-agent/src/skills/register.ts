import { Context } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { getRedisClient, updateField } from "../plugins/redis.js";
import { isAddress } from "viem";

export const registerEmployees: Skill[] = [
  {
    skill: "register",
    examples: [
      "/register John 0x123... 1000 15",
      "/register Alice 0xabc... 2000 30",
    ],
    description: "Register a new employee with their payment details",
    handler: handler,
    params: {
      name: {
        type: "string",
      },
      address: {
        type: "address",
      },
      salary: {
        type: "number",
      },
      paymentDate: {
        type: "number",
      },
    },
  },
];

export async function handler(context: Context) {
  console.log("Processing employee registration...");
  const {
    message: {
      content: {
        params: { name, address, salary, paymentDate },
      },
      sender,
    },
  } = context;

  if (!isAddress(address)) {
    console.log(`Invalid address provided: ${address}`);
    return {
      code: 400,
      message: "Invalid employee address provided",
    };
  }

  if (paymentDate < 1 || paymentDate > 31) {
    console.log(`Invalid payment date provided: ${paymentDate}`);
    return {
      code: 400,
      message: "Payment date must be between 1 and 31",
    };
  }

  try {
    const redisClient = await getRedisClient();
    const employeeKey = `employee:${sender.address}:${address.toLowerCase()}`;

    const employeeData = {
      name,
      address,
      salary,
      paymentDate,
      registeredAt: new Date().toISOString(),
      owner: sender.address,
    };

    console.log(`Registering employee with data:`, employeeData);
    await updateField(redisClient, employeeKey, employeeData);

    console.log(`Successfully registered employee ${name}`);
    return {
      code: 200,
      message: `Successfully registered ${name} with salary ${salary} USDC to be paid on day ${paymentDate} of each month.`,
    };
  } catch (error) {
    console.error("Error registering employee:", error);
    return {
      code: 500,
      message: "Failed to register employee. Please try again.",
    };
  }
} 