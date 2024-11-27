import {
  run,
  agentReply,
  replaceVariables,
  XMTPContext,
  Agent,
  xmtpClient,
  V3Client,
} from "@xmtp/message-kit";
import fs from "fs";
import { systemPrompt } from "./prompt.js";
import { token } from "./skills/token.js";
import { todo } from "./skills/todo.js";
import { gated, startGatedGroupServer } from "./skills/gated.js";
import { broadcast } from "./skills/broadcast.js";
import { wordle } from "./skills/wordle.js";

export const agent: Agent = {
  name: "Experimental Agent",
  tag: "@bot",
  description: "An experimental agent with a lot of skills.",
  skills: [
    ...token,
    ...(process?.env?.RESEND_API_KEY ? todo : []),
    ...(process?.env?.ALCHEMY_SDK ? gated : []),
    ...broadcast,
    ...wordle,
  ],
};

const { client } = await xmtpClient({
  hideInitLogMessage: true,
});

startGatedGroupServer(client);
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
  { agent },
);
