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
import { token } from "./skills/token.js";
import { todo } from "./skills/todo.js";
import { gated } from "./skills/gated.js";
import { broadcast } from "./skills/broadcast.js";

export const agent: Agent = {
  name: "Experimental Agent",
  tag: "@exp",
  description: "An experimental agent with a lot of skills.",
  skills: [...token, ...todo, ...gated, ...broadcast],
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
