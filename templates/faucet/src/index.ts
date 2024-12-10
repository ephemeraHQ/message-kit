import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { faucet } from "./skills/faucet.js";

// [!region skills]
export const agent: Agent = {
  name: "Faucet Agent",
  tag: "@bot",
  description: "A faucet delivery agent.",
  skills: [faucet],
  onMessage: async (context: XMTPContext) => {
    const {
      message: { sender },
      agent,
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);

    await agentReply(context, prompt);
  },
};
run(agent);
