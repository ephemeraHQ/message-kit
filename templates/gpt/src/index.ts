import { run, agentReply, replaceVariables } from "@xmtp/message-kit";

import { systemPrompt } from "./prompt.js";

run(async (context) => {
  const {
    message: { sender },
    runConfig,
  } = context;

  let prompt = await replaceVariables(
    systemPrompt,
    sender.address,
    runConfig?.skills,
    "@bot",
  );
  await agentReply(context, prompt);
});
