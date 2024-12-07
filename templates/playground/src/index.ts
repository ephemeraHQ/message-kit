import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
  xmtpClient,
} from "@xmtp/message-kit";
import fs from "fs";
import { systemPrompt } from "./prompt.js";
import { web } from "./skills/web.js";
import { cryptoPrice } from "./skills/cryptoPrice.js";
import { search } from "./skills/search.js";
export const agent: Agent = {
  name: "Playground Agent",
  tag: "@bot",
  description: "A playground agent with a lot of skills.",
  skills: [...web, ...cryptoPrice, ...search],
};

// [!region gated]
const { client } = await xmtpClient({
  hideInitLogMessage: true,
});

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
  { agent, experimental: true },
);
