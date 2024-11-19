import {
  run,
  XMTPContext,
  agentReply,
  replaceVariables,
} from "@xmtp/message-kit";
import { skills } from "./skills.js";
import { systemPrompt } from "./prompt.js";

run(
  async (context: XMTPContext) => {
    const {
      message: { sender },
      runConfig,
    } = context;

    let prompt = await replaceVariables(
      systemPrompt,
      sender.address,
      runConfig?.skills,
      "@ens",
    );
    await agentReply(context, prompt);
  },
  { skills },
);
