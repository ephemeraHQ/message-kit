import { run, XMTPContext, agentReply } from "@xmtp/message-kit";
import { agent_prompt } from "./prompt.js";

run(async (context: XMTPContext) => {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set");
    context.send("gm");
    return;
  }

  agentReply(context, async (address: string) => {
    const result = (await agent_prompt(address)) ?? "No response available";
    return result;
  });
});
