// [!region index]
import {
  run,
  agentReply,
  parsePrompt,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";

export const agent: Agent = {
  name: "GPT Bot",
  tag: "@bot",
  description: "Use GPT to generate text responses.",
  onMessage: async (context: XMTPContext) => {
    const {
      message: {
        sender,
        content: { text },
      },
      agent,
    } = context;
    // [!endregion index]

    let prompt = await parsePrompt(systemPrompt, sender.address, agent);
    await agentReply(context, prompt);

    // [!region final]
  },
};

run(agent);
// [!endregion final]
