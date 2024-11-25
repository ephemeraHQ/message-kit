import { run, xmtpClient, Agent, XMTPContext } from "@xmtp/message-kit";
import { startServer } from "./handlers/gated.js";
import { verifiedRequest } from "./handlers/gated.js";
import { registerSkill as gatedSkill } from "./handlers/gated.js";

const { client } = await xmtpClient({ hideInitLogMessage: true });
startServer(client, verifiedRequest);

export const agent: Agent = {
  name: "GPT Bot",
  tag: "@bot",
  description: "Create and get group id.",
  skills: [...gatedSkill],
};

run(
  async (context: XMTPContext) => {
    const {
      message: { sender },
    } = context;
  },
  { agent },
);
