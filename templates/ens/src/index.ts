import { createAgent } from "@xmtp/message-kit";
import { checkDomain } from "./skills/check.js";
import { cool } from "./skills/cool.js";
import { info } from "./skills/info.js";
import { register } from "./skills/register.js";
import { renew } from "./skills/renew.js";
import { pay } from "./skills/pay.js";

export const agent = createAgent({
  name: "Ens Agent",
  tag: "@bot",
  description: "A ens agent with a lot of skills.",
  skills: [checkDomain, cool, info, register, renew, pay],
}).run();
