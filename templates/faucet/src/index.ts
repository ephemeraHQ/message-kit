import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
} from "@xmtp/message-kit";
import { systemPrompt } from "./prompt.js";
import { faucet } from "./skills/faucet.js";

// [!region skills]
export const agent: Agent = {
  name: "Faucet Agent",
  tag: "@bot",
  description: "A faucet delivery agent.",
  skills: [...faucet],
};
// [!endregion skills]

// [!region run1]
run(
  async (context: XMTPContext) => {
    const {
      message: { sender },
      agent,
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);

    // [!region run2]
    await agentReply(context, prompt);
  },
  { agent },
);

// [!endregion run1]
