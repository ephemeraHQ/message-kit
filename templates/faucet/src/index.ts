import { agentReply, Context, createAgent } from "@xmtp/message-kit";
import { faucet } from "./skills/faucet.js";

// [!region skills]
export const agent = createAgent({
  name: "Faucet Agent",
  tag: "@bot",
  description: "A faucet delivery agent.",
  intro:
    "You are a testnet fund delivery agent. Show the networks and deliver the funds. When greet execute the network skill.",
  skills: [faucet],
  onMessage: async (context: Context) => {
    await agentReply(context);
  },
}).run();

// [!endregion skills]
