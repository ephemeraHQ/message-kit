import { run } from "@xmtp/message-kit";
import { Agent } from "@xmtp/message-kit";

const agent: Agent = {
  name: "Gm Bot",
  tag: "@bot",
  description: "Gm bot for base.",
  skills: [],
  onMessage: async (context) => {
    const { group } = context;
    if (!group) {
      await context.send(`gm`);
    }
  },
};

run(agent);
