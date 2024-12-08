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

run(
  async (context: XMTPContext) => {
    const {
      message: {
        sender,
        content: { text },
      },
      agent,
    } = context;

    if (text == "image") {
      await context.sendImage("hero.jpg");
    } else if (text == "remote") {
      await context.sendImage("https://picsum.photos/200/300");
    } else {
      let prompt = await replaceVariables(systemPrompt, sender.address, agent);
      //This is only used for to update the docs.
      fs.writeFileSync("example_prompt.md", prompt);
      await agentReply(context, prompt);
    }
  },
  { agent, experimental: true },
);
