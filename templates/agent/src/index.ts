import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { checkDomain } from "./skills/check.js";
import { cool } from "./skills/cool.js";
import { info } from "./skills/info.js";
import { register } from "./skills/register.js";
import { renew } from "./skills/renew.js";
import { pay } from "./skills/pay.js";
import { reset } from "./skills/reset.js";
import { game } from "./skills/game.js";
import fs from "fs";

// [!region skills]
export const agent: Agent = {
  name: "Ens Agent",
  tag: "@bot",
  description: "A ens agent with a lot of skills.",
  skills: [
    ...checkDomain,
    ...cool,
    ...info,
    ...register,
    ...renew,
    ...reset,
    ...pay,
    ...game,
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
