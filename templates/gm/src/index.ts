import { createAgent } from "@xmtp/message-kit";

export const agent = createAgent({
  name: "Gm Bot",
  tag: "@bot",
  description: "Gm bot.",
  onMessage: async (context) => {
    const { isDM } = context;
    if (isDM) {
      await context.send({ message: "gm", originalMessage: context.message });
    }
  },
}).run();
