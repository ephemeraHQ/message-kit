import { concierge, createAgent } from "@xmtp/message-kit";

export const agent = createAgent({
  name: "Circle Wallet Agent",
  tag: "@bot",
  description: "A payment agent with its own wallet powered by Circle",
  skills: [concierge],
  config: {
    walletService: true,
  },
}).run();
