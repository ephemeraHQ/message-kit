import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
//Imports from the agent package
import { registerSkill as paySkill } from "../../agent/dist/skills/pay.js";
import { registerSkill as resetSkill } from "../../agent/dist/skills/reset.js";
//Local imports
import { registerSkill as tokenSkill } from "./skills/token.js";
import { registerSkill as todoSkill } from "./skills/todo.js";
import { registerSkill as gatedSkill } from "./skills/gated.js";

export const agent: Agent = {
  name: "Experimental Agent",
  tag: "@exp",
  description: "An experimental agent with a lot of skills.",
  skills: [
    ...resetSkill,
    ...paySkill,
    ...tokenSkill,
    ...todoSkill,
    ...gatedSkill,
  ],
};
run(
  async (context: XMTPContext) => {
    const {
      message: { sender },
      agent,
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);

    await agentReply(context, prompt);
  },
  { agent },
);
