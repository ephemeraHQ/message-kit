import { createAgent } from "@xmtp/message-kit";
import { concierge } from "./skills/concierge.js";
import { systemPrompt } from "./prompt.js";
import { toss } from "./skills/toss.js";

export const agent = createAgent({
  name: "Toss Bot",
  tag: "@toss",
  description: "Create a coin toss.",
  skills: [toss, concierge],
  systemPrompt,
  config: {
    walletService: true,
  },
}).run();
