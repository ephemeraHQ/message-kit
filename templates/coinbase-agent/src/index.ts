import { registerSkill as swapSkill } from "./skills/swap.js";
import { registerSkill as mintSkill } from "./skills/mint.js";
import { registerSkill as dripSkill } from "./skills/drip.js";
import { registerSkill as paySkill } from "./skills/pay.js";
import { run, XMTPContext, agentReply, Agent } from "@xmtp/message-kit";
import { replaceVariables } from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";

export const frameUrl = "https://ens.steer.fun/";
export const baseUrl = "https://base-tx-frame.vercel.app/transaction";
export const ensUrl = "https://app.ens.domains/";

export const agent: Agent = {
  name: "Swap Bot",
  tag: "@base",
  description: "Swap bot for base.",
  skills: [swapSkill, mintSkill, dripSkill, paySkill],
  systemPrompt: systemPrompt,
  onMessage: async (context: XMTPContext) => {
    const {
      message: { sender },
      agent,
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);
    await agentReply(context, prompt);
  },
};

run(agent);
