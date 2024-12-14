import { run, Agent, waas } from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { toss } from "./skills/toss.js";

export const agent: Agent = {
  name: "Toss Bot",
  tag: "@toss",
  description: "Create a coin toss.",
  skills: [toss, waas],
  systemPrompt,
};

run(agent);
