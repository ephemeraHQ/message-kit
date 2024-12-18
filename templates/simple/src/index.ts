// [!region index]
import { agentReply, Context, createAgent } from "@xmtp/message-kit";

export const agent = createAgent({
  name: "GPT Bot",
  description: "Use GPT to generate text responses.",
  tag: "@bot",
  onMessage: async (context: Context) => {
    // [!endregion index]
    await agentReply(context);
    // [!region final]
  },
}).run();
// [!endregion final]
