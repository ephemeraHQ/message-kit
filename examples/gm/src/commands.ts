import { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "Agent Commands",
    triggers: ["/activate", "/deactivate", "/prompt", "/enable", "/disable"],
    description: "Commands to interact with the Converse Agent.",
    commands: [
      {
        command: "/activate",
        description: "Activate the agent for your account.",
        handler: undefined,
        params: {},
      },
      {
        command: "/deactivate",
        description: "Deactivate the agent.",
        handler: undefined,
        params: {},
      },
      {
        command: "/prompt [prompt]",
        description: "Customize the agent's system prompt.",
        handler: undefined,
        params: {
          prompt: { type: "string" },
        },
      },
      {
        command: "/enable",
        description: "Enable the agent to respond on your behalf.",
        handler: undefined,
        params: {},
      },
      {
        command: "/disable",
        description: "Disable the agent from responding on your behalf.",
        handler: undefined,
        params: {},
      },
    ],
  },
];
