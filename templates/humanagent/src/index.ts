import {
  run,
  Agent,
  XMTPContext,
  replaceVariables,
  agentReply,
} from "@xmtp/message-kit";
import { degen } from "./vibes/degen.js";
import { systemPrompt } from "./prompt.js";
import { waas } from "./skills/waas.js";

const agent: Agent = {
  name: "Human Agent",
  tag: "@bot",
  description: "A human agent for managing your funds",
  vibe: degen,
  skills: [waas],
  onMessage: async (context: XMTPContext) => {
    const {
      message: { sender },
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);

    await agentReply(context, prompt);
  },
};

run(agent);
