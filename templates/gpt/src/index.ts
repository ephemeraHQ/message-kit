import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
} from "@xmtp/message-kit";

import { systemPrompt } from "./prompt.js";
export const skills = [
  {
    name: "GPT Bot",
    tag: "@bot",
    description: "Use GPT to answer questions.",
    skills: [],
  },
];

run(async (context: XMTPContext) => {
  const {
    message: { sender },
  } = context;

  let prompt = await replaceVariables(
    systemPrompt,
    sender.address,
    skills,
    skills[0].tag,
  );
  await agentReply(context, prompt);
});
