import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { registerSkill as checkSkill } from "./skills/check.js";
import { registerSkill as coolSkill } from "./skills/cool.js";
import { registerSkill as infoSkill } from "./skills/info.js";
import { registerSkill as registerSkill } from "./skills/register.js";
import { registerSkill as renewSkill } from "./skills/renew.js";
import { registerSkill as paySkill } from "./skills/pay.js";
import { registerSkill as resetSkill } from "./skills/reset.js";
import { registerSkill as gameSkill } from "./skills/game.js";
import fs from "fs";

export const frameUrl = "https://ens.steer.fun/";
export const ensUrl = "https://app.ens.domains/";

// [!region skills]
export const agent: Agent = {
  name: "Web3 Agent",
  tag: "@bot",
  description: "A web3 agent with a lot of skills.",
  skills: [
    ...checkSkill,
    ...coolSkill,
    ...infoSkill,
    ...registerSkill,
    ...renewSkill,
    ...resetSkill,
    ...paySkill,
    ...gameSkill,
  ],
};
// [!endregion skills]

// [!region run1]
run(
  async (context: XMTPContext) => {
    const {
      message: { sender },
      agent,
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);
    // [!region run1]
    //This is only used for to update the docs.
    fs.writeFileSync("example_prompt.md", prompt);
    // [!region run2]
    await agentReply(context, prompt);
  },
  { agent },
);

// [!endregion run2]
