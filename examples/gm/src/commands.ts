import { handler as handlerAll } from "./handler.js";
import type { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "Agent Commands",
    description: "Commands to interact with the Converse Agent.",
    commands: [
      {
        command: "/activate",
        triggers: ["/activate"],
        description: "Activate the agent for your account.",
        handler: handlerAll,
        params: {},
      },
      {
        command: "/deactivate",
        triggers: ["/deactivate"],
        description: "Deactivate the agent.",
        handler: handlerAll,
        params: {},
      },
      {
        command: "/prompt [prompt]",
        triggers: ["/prompt"],
        description: "Customize the agent's system prompt.",
        handler: handlerAll,
        params: {
          prompt: { type: "string" },
        },
      },
      {
        command: "/enable",
        triggers: ["/enable"],
        description: "Enable the agent to respond on your behalf.",
        handler: handlerAll,
        params: {},
      },
      {
        command: "/disable",
        triggers: ["/disable"],
        description: "Disable the agent from responding on your behalf.",
        handler: handlerAll,
        params: {},
      },
    ],
  },
];
