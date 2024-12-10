import { run, Agent } from "@xmtp/message-kit";
import { degen } from "./vibes/degen.js";
import { systemPrompt } from "./prompt.js";
import { waas } from "./skills/waas.js";

const agent: Agent = {
  name: "Human Agent",
  tag: "@bot",
  description: "A human agent for managing your funds",
  vibe: degen,
  systemPrompt,
  skills: [waas],
};

run(agent);
