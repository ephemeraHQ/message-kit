import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { registerSkill as checkSkill } from "./handlers/check.js";
import { registerSkill as coolSkill } from "./handlers/cool.js";
import { registerSkill as infoSkill } from "./handlers/info.js";
import { registerSkill as registerSkill } from "./handlers/register.js";
import { registerSkill as renewSkill } from "./handlers/renew.js";
import { registerSkill as paySkill } from "./handlers/pay.js";
import { registerSkill as resetSkill } from "./handlers/reset.js";
import { registerSkill as tokenSkill } from "./handlers/token.js";
import { registerSkill as gameSkill } from "./handlers/game.js";
import { registerSkill as todoSkill } from "./handlers/todo.js";
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
    ...tokenSkill,
    ...gameSkill,
    ...(process.env.RESEND_API_KEY ? todoSkill : []),
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
