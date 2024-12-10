import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { web } from "./skills/web.js";
import { cryptoPrice } from "./skills/cryptoPrice.js";
import { search } from "./skills/search.js";
import { friendly } from "./vibes/friendly.js";

export const agent: Agent = {
  name: "Playground Agent",
  tag: "@bot",
  description: "A playground agent with a lot of skills.",
  skills: [web, cryptoPrice, search],
  vibe: friendly,
  onMessage: async (context: XMTPContext) => {
    const {
      message: { sender },
      agent,
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);
    await agentReply(context, prompt);
  },
  config: {
    experimental: true,
  },
};

run(agent);
