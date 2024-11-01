import { handler as handlerAll } from "./handler.js";
import type { AgentSkill } from "@xmtp/message-kit";

export const commands: AgentSkill[] = [
  {
    name: "Gm Commands",
    description: "Commands to send a gm.",
    commands: [
      {
        command: "/gm",
        triggers: ["/gm"],
        description: "Send a gm.",
        handler: handlerAll,
        params: {},
      },
    ],
  },
];
