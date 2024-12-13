// [!region index]
import { run, agentReply, Context, Agent } from "@xmtp/message-kit";

export const agent: Agent = {
  name: "GPT Bot",
  description: "Use GPT to generate text responses.",
  tag: "@bot",
  onMessage: async (context: Context) => {
    // [!endregion index]
    await agentReply(context);
    // [!region final]
  },
};

run(agent);
// [!endregion final]
