import { run, agentReply, Context, Agent } from "@xmtp/message-kit";
import { web } from "./skills/web.js";
import { cryptoPrice } from "./skills/cryptoPrice.js";
import { search } from "./skills/search.js";
import { professional } from "./vibes/professional.js";
export const frameUrl = "https://ens.steer.fun/";
export const baseUrl = "https://base-tx-frame.vercel.app/transaction";
export const ensUrl = "https://app.ens.domains/";

export const agent: Agent = {
  name: "Playground Agent",
  tag: "@bot",
  description: "A playground agent with a lot of skills.",
  skills: [web, cryptoPrice, search],
  vibe: professional,
  onMessage: async (context: Context) => {
    await agentReply(context);
  },
  config: {
    experimental: true,
  },
};

run(agent);
