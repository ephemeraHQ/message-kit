import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";

import { systemPrompt } from "./prompt.js";
import { toss } from "./skills/toss.js";
import fs from "fs";
import { getWalletService } from "./plugins/redis.js";
const walletServiceDB = await getWalletService();
export const agent: Agent = {
  name: "Toss Bot",
  tag: "@toss",
  description: "Create a coin toss.",
  skills: [...toss],
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
  { agent, walletServiceDB },
);
