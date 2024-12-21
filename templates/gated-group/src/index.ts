import { createAgent } from "@xmtp/message-kit";
import { XMTP } from "xmtp";
import { gated } from "./skills/gated.js";
import { startGatedGroupServer } from "./skills/gated.js";

const { client } = await XMTP();

startGatedGroupServer(client);

export const agent = createAgent({
  name: "Gated Group Creator Agent",
  tag: "@bot",
  description: "A gated group creator agent.",
  intro: "You are a gated group creator agent.",
  skills: [gated],
}).run();
