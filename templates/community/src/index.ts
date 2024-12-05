import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
  xmtpClient,
} from "@xmtp/message-kit";
import fs from "fs";
import { systemPrompt } from "./prompt.js";
import { token } from "./skills/token.js";
import { todo } from "./skills/todo.js";
import { gated, startGatedGroupServer } from "./skills/gated.js";
import { broadcast } from "./skills/broadcast.js";
import { wordle } from "./skills/wordle.js";
import { dalle } from "./skills/dalle.js";

export const agent: Agent = {
  name: "community Agent",
  tag: "@bot",
  description: "An community agent with a lot of skills.",
  skills: [
    ...token,
    ...(process?.env?.RESEND_API_KEY ? todo : []),
    ...(process?.env?.ALCHEMY_SDK ? gated : []),
    ...broadcast,
    ...wordle,
    ...dalle,
  ],
};

// [!region gated]
const { client } = await xmtpClient({
  hideInitLogMessage: true,
});

startGatedGroupServer(client);
// [!endregion gated]

run(
  async (context: XMTPContext) => {
    const {
      message: { sender },
      agent,
    } = context;

    let prompt = await replaceVariables(systemPrompt, sender.address, agent);

    //This is only used for to update the docs.
    fs.writeFileSync("example_prompt.md", prompt);
    await agentReply(context, prompt);
  },
  { agent, experimental: true },
);
