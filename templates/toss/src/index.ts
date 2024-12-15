import { run, Agent, concierge } from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { toss } from "./skills/toss.js";

export const agent: Agent = {
  name: "Toss Bot",
  tag: "@toss",
  description: "Create a coin toss.",
  skills: [toss, concierge],
  systemPrompt,
  config: {
    walletService: true,
  },
};

run(agent);
