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
    skills,
  } = context;

  try {
    let prompt = await replaceVariables(
      systemPrompt,
      sender.address,
      skills ?? [],
      "@bot",
    );
    await agentReply(context, prompt);
  } catch (error) {
    console.error(error);
  }
});
