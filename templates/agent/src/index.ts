import { run, HandlerContext } from "@xmtp/message-kit";
import { agentRun } from "@xmtp/message-kit";
import { agent_prompt } from "./prompt.js";

run(async (context: HandlerContext) => {
  const {
    message: { sender },
  } = context;

  agentRun(context, async (address: string) => {
    const result = (await agent_prompt(address)) ?? "No response available";
    return result;
  });
});
