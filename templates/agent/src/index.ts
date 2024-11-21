import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { registerSkill as checkSkill } from "./handlers/check.js";
import { registerSkill as coolSkill } from "./handlers/cool.js";
import { registerSkill as infoSkill } from "./handlers/info.js";
import { registerSkill as registerSkill } from "./handlers/register.js";
import { registerSkill as renewSkill } from "./handlers/renew.js";
import { registerSkill as resetSkill } from "./handlers/reset.js";
import { registerSkill as tipSkill } from "./handlers/tip.js";
import fs from "fs";

export const frameUrl = "https://ens.steer.fun/";
export const ensUrl = "https://app.ens.domains/";
export const txpayUrl = "https://txpay.vercel.app";

// [!region skills]
export const skills = [
  {
    name: "Ens Domain Bot",
    tag: "@ens",
    description: "Register ENS domains.",
    skills: [
      ...checkSkill,
      ...coolSkill,
      ...infoSkill,
      ...registerSkill,
      ...renewSkill,
      ...resetSkill,
      ...tipSkill,
    ],
  },
];
// [!endregion skills]

// [!region run]
run(
  async (context: XMTPContext) => {
    const {
      message: { sender },
      skills,
    } = context;

    let prompt = await replaceVariables(
      systemPrompt,
      sender.address,
      skills,
      "@ens",
    );
    fs.writeFileSync("example_prompt.md", prompt);
    await agentReply(context, prompt);
  },
  { skills },
);

// [!endregion run]
