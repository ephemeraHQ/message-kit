import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";

import { systemPrompt } from "./prompt.js";
export const agent: Agent = {
  name: "GPT Bot",
  tag: "@bot",
  description: "Use GPT to answer questions.",
  skills: [],
};

run(async (context: XMTPContext) => {
  const {
    message: { sender },
  } = context;

  let prompt = await replaceVariables(systemPrompt, sender.address, agent);
  await agentReply(context, prompt);
});
