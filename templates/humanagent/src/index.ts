import { run, Agent } from "@xmtp/message-kit";
import { degen } from "./vibes/degen.js";
import { systemPrompt } from "./prompt.js";
import { waas } from "./skills/waas.js";

const agent: Agent = {
  name: "Human Agent",
  tag: "@bot",
  description: "A human agent for managing your funds",
  vibe: degen,
  systemPrompt,
  skills: [waas],
};

run(agent);

// Deployed https://railway.app/project/ae977175-7a24-456e-8958-d1a5022afac5/service/30a7c549-cfba-4780-9746-dd4fd9818ccc?environmentId=fdef8588-7ec0-45fd-b7f9-8ab938727849
