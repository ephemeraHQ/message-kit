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
  } = context;

  let prompt = await replaceVariables(systemPrompt, sender.address, [], "@bot");
  await agentReply(context, prompt);
});
