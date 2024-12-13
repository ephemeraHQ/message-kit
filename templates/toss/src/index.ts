import { run, agentReply, Context, Agent } from "@xmtp/message-kit";

import { systemPrompt } from "./prompt.js";
import { toss } from "./skills/toss.js";
import { waas } from "./skills/waas.js";

export const agent: Agent = {
  name: "Toss Bot",
  tag: "@toss",
  description: "Create a coin toss.",
  skills: [toss, waas],
  systemPrompt,
  onMessage: async (context: Context) => {
    await agentReply(context);
  },
};

run(agent);
