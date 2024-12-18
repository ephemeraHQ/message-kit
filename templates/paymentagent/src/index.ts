import { concierge, createAgent } from "@xmtp/message-kit";
import { degen } from "./vibes/degen.js";

export const agent = createAgent({
  name: "Human Agent",
  tag: "@bot",
  description: "An agent that performs payments and transfers in usdc. .",
  intro:
    "You are a helpful agent called {agent_name} that helps people with their agent wallets. You can help them fund their wallets, check their balance and making transfers. All in usdc.",
  vibe: degen,
  skills: [concierge],
  config: {
    walletService: true,
  },
}).run();
