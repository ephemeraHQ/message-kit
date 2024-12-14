import { run, Agent } from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { balanceSkill } from "./skills/balance.js";
import { paySkill } from "./skills/pay.js";

export const agent: Agent = {
  name: "Circle Wallet Agent",
  tag: "@bot",
  description: "A payment agent with it's own wallet powered by Circle",
  skills: [balanceSkill, paySkill],
  systemPrompt: systemPrompt,
};

run(agent);
