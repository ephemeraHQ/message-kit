import { Context } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { getRedisClient } from "../plugins/redis.js";
import { isAddress } from "viem";

export const removeEmployee: Skill[] = [
  {
    skill: "remove",
    examples: ["/remove 0x123..."],
    description: "Remove an employee from the payroll system",
    handler: handler,
    params: {
      address: {
        type: "address",
      },
    },
  },
];

export async function handler(context: Context) {
  const {
    message: {
      content: {
        params: { address },
      },
    },
  } = context;

  if (!isAddress(address)) {
    return {
      code: 400,
      message: "Invalid employee address provided",
    };
  }

  const redisClient = await getRedisClient();
  const employeeKey = `employee:${address.toLowerCase()}`;

  const employeeData = await redisClient.get(employeeKey);
  if (!employeeData) {
    return {
      code: 404,
      message: "Employee not found in the system",
    };
  }

  await redisClient.del(employeeKey);

  const employee = JSON.parse(employeeData);
  return {
    code: 200,
    message: `Successfully removed ${employee.name} from the payroll system`,
  };
} 