import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import fs from "fs";
//Local imports
import { registerSkill as tokenSkill } from "./skills/token.js";
import { registerSkill as todoSkill } from "./skills/todo.js";
import { registerSkill as gatedSkill } from "./skills/gated.js";

export const agent: Agent = {
  name: "Experimental Agent",
  tag: "@exp",
  description: "An experimental agent with a lot of skills.",
  skills: [...tokenSkill, ...todoSkill, ...gatedSkill],
};
run(
  async (context: XMTPContext) => {
    const {
      message: { sender },
      agent,
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);

    //This is only used for to update the docs.
    fs.writeFileSync("example_prompt.md", prompt);
    await agentReply(context, prompt);
  },
  { agent },
);
