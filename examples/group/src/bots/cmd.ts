import { HandlerContext } from "@xmtp/botkit";
import { commands } from "../commands.js"; // Assuming commands.ts is in the same directory
import { extractCommandValues } from "@xmtp/botkit";

export async function handler(context: HandlerContext) {
  const { content, senderAddress } = context.message;
  let inputContent = "";

  inputContent = "/tip @john @fabri 15";

  console.log(inputContent, extractCommandValues(inputContent, commands));

  inputContent = "/tip @john @fabri 15";

  console.log(inputContent, extractCommandValues(inputContent, commands));

  inputContent = "/swap 10 eth to usdc";

  console.log(inputContent, extractCommandValues(inputContent, commands));

  inputContent = "/send 10 usd @fabri";

  console.log(inputContent, extractCommandValues(inputContent, commands));

  inputContent = "/game slot";

  console.log(inputContent, extractCommandValues(inputContent, commands));

  inputContent = "/bet @fabri @bob 'NBA Game' 100";

  console.log(inputContent, extractCommandValues(inputContent, commands));
}
