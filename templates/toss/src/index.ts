import {
  run,
  agentReply,
  parsePrompt,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";

import { systemPrompt } from "./prompt.js";
import { toss } from "./skills/toss.js";
import { waas } from "./skills/waas.js";

export const agent: Agent = {
  name: "Toss Bot",
  tag: "@toss",
  description: "Create a coin toss.",
  skills: [toss, waas],
  onMessage: async (context: XMTPContext) => {
    const {
      message: { sender },
    } = context;

    let prompt = await parsePrompt(systemPrompt, sender.address, agent);

    await agentReply(context, prompt);
  },
};

run(agent);
