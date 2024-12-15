import { run, Agent, waas } from "@xmtp/message-kit";

export const agent: Agent = {
  name: "Circle Wallet Agent",
  tag: "@bot",
  description: "A payment agent with its own wallet powered by Circle",
  skills: [waas],
  config: {
    walletService: true,
  },
};

run(agent);
