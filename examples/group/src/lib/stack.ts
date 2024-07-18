import { StackClient } from "@stackso/js-core";

let stack: StackClient | null = null;

export function getStackClient(): StackClient | null {
  if (!process?.env?.STACK_API_KEY) {
    console.log("No STACK_API_KEY found in .env");
    return null;
  }
  if (!stack) {
    stack = new StackClient({
      apiKey: process.env.STACK_API_KEY as string,
      pointSystemId: 2893,
    });
  }
  return stack;
}
export type { StackClient };
