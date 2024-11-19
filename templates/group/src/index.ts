import { run, agentReply, replaceVariables } from "@xmtp/message-kit";
import { registerSkill as tippingSkill } from "./handlers/tipping.js";
import { registerSkill as paymentSkill } from "./handlers/payment.js";
import { registerSkill as gameSkill } from "./handlers/game.js";
import { registerSkill as helperSkill } from "./handlers/helpers.js";
import { systemPrompt } from "./prompt.js";

export const skills = [
  {
    name: "Group bot",
    tag: "@bot",
    description: "Group agent for tipping payments, games and more.",
    skills: [...tippingSkill, ...paymentSkill, ...gameSkill, ...helperSkill],
  },
];

run(
  async (context) => {
    const {
      message: { sender },
      runConfig,
    } = context;

    let prompt = await replaceVariables(
      systemPrompt,
      sender.address,
      runConfig?.skills,
      "@bot",
    );
    await agentReply(context, prompt);
  },
  { skills },
);
