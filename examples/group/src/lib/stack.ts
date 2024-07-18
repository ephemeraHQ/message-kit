import { StackClient } from "@stackso/js-core";

let stack: StackClient | null = null;

export function getStackClient(): StackClient {
  if (!stack) {
    if (!process?.env?.STACK_API_KEY) {
      throw new Error("STACK_API_KEY is not defined");
    }
    stack = new StackClient({
      apiKey: process.env.STACK_API_KEY as string,
      pointSystemId: 2893,
    });
  }
  return stack;
}
export type { StackClient };
