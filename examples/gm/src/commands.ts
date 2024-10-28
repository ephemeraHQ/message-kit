import { handler as handlerAll } from "./handler.js";
import type { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "Gm Commands",
    description: "Commands to send a gm.",
    commands: [
      {
        command: "/gm",
        memberChange: true,
        triggers: ["/gm"],
        description: "Send a gm.",
        handler: handlerAll,
        params: {},
      },
    ],
  },
];
