import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";

export const agent: Agent = {
  name: "GPT Bot",
  tag: "@bot",
  description: "Use GPT to generate text responses.",
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
