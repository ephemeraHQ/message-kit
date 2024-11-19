import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
} from "@xmtp/message-kit";

import { systemPrompt } from "./prompt.js";

run(async (context: XMTPContext) => {
  const {
    message: { sender },
    runConfig,
  } = context;

  let prompt = await replaceVariables(
    systemPrompt,
    sender.address,
    skills,
    "@bot",
  );
  await agentReply(context, prompt);
});
