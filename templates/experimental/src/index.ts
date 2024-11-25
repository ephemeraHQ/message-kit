import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { registerSkill as paySkill } from "./skills/pay.js";
import { registerSkill as resetSkill } from "./skills/reset.js";
import { registerSkill as tokenSkill } from "./skills/token.js";
import { registerSkill as todoSkill } from "./skills/todo.js";
import { registerSkill as infoSkill } from "./skills/info.js";
import { registerSkill as gatedSkill } from "./skills/gated.js";

export const frameUrl = "https://ens.steer.fun/";
export const ensUrl = "https://app.ens.domains/";

export const agent: Agent = {
  name: "Web3 Agent",
  tag: "@bot",
  description: "A web3 agent with a lot of skills.",
  skills: [
    ...resetSkill,
    ...paySkill,
    ...tokenSkill,
    ...todoSkill,
    ...infoSkill,
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
