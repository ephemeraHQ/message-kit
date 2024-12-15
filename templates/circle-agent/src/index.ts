import { run, Agent, concierge } from "@xmtp/message-kit";

export const agent: Agent = {
  name: "Circle Wallet Agent",
  tag: "@bot",
  description: "A payment agent with its own wallet powered by Circle",
  skills: [concierge],
  config: {
    walletService: true,
  },
};

run(agent);
