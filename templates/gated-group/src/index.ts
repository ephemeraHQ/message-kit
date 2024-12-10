import { run, Agent, xmtpClient } from "@xmtp/message-kit";
import { gated } from "./skills/gated.js";
import { startGatedGroupServer } from "./skills/gated.js";

const { client } = await xmtpClient({
  hideInitLogMessage: true,
});

startGatedGroupServer(client);

export const agent: Agent = {
  name: "Gated Group Creator Agent",
  tag: "@bot",
  description: "A gated group creator agent.",
  skills: [gated],
};
run(agent);
