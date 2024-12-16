import { run, Agent } from "@xmtp/message-kit";

const agent: Agent = {
  name: "Gm Bot",
  tag: "@bot",
  description: "Gm bot.",
  onMessage: async (context) => {
    const { group } = context;

    if (!group) {
      await context.send(`gm`);
    }
  },
};

run(agent);
