import { createAgent } from "@xmtp/message-kit";

export const agent = createAgent({
  name: "Gm Bot",
  tag: "@bot",
  description: "Gm bot.",
  onMessage: async (context) => {
    const { group } = context;

    if (!group) {
      await context.send(`gm`);
    }
  },
}).run();
