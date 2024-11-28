import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";

import { systemPrompt } from "./prompt.js";
import { toss } from "./skills/cointoss.js";
import { cash } from "./skills/cash.js";
import fs from "fs";

export const agent: Agent = {
  name: "GPT Bot",
  tag: "@bot",
  description: "Use GPT to answer questions.",
  skills: [...toss, ...cash],
};

run(
  async (context: XMTPContext) => {
    const {
      message: { sender },
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);
    //This is only used for to update the docs.
    fs.writeFileSync("example_prompt.md", prompt);
    await agentReply(context, prompt);
  },
  { agent },
);
