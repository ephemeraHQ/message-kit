import {
  run,
  XMTPContext,
  agentReply,
  replaceVariables,
} from "@xmtp/message-kit";

import { systemPrompt } from "./prompt.js";

run(async (context: XMTPContext) => {
  const {
    message: { sender },
    config,
  } = context;

  let prompt = await replaceVariables(
    systemPrompt,
    sender.address,
    config?.skills,
    "@bot",
  );
  await agentReply(context, prompt);
});
