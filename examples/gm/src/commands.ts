//@ts-nocheck
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
        handler: function (context) {
          console.log("activate");
        },
        params: {},
      },
      {
        command: "/deactivate",
        description: "Deactivate the agent.",
        handler: function (context) {
          console.log("deactivate");
        },
        params: {},
      },
      {
        command: "/prompt [prompt]",
        description: "Customize the agent's system prompt.",
        handler: function (context) {
          console.log("set prompt");
        },
        params: {
          prompt: { type: "string" },
        },
      },
      {
        command: "/enable",
        description: "Enable the agent to respond on your behalf.",
        handler: function (context) {
          console.log("enable");
        },
        params: {},
      },
      {
        command: "/disable",
        description: "Disable the agent from responding on your behalf.",
        handler: function (context) {
          console.log("disable");
        },
        params: {},
      },
    ],
  },
];
