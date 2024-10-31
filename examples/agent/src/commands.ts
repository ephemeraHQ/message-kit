import type { CommandGroup } from "@xmtp/message-kit";
import { ensAgent, handleEns } from "./handler/ens.js";

export const commands: CommandGroup[] = [
  {
    name: "Ens Domain Bot",
    description: "Register ENS domains.",
    commands: [
      {
        command: "/register [domain]",
        triggers: ["/register", "@ensbot"],
        handler: handleEns,
        description: "Register a domain.",
        params: {
          domain: {
            type: "string",
          },
        },
      },
      {
        command: "/info [domain]",
        triggers: ["/info", "@ensbot"],
        handler: handleEns,
        description: "Get information about a domain.",
        params: {
          domain: {
            type: "string",
          },
        },
      },
      {
        command: "/renew [domain]",
        triggers: ["/renew", "@ensbot"],
        handler: handleEns,
        description: "Renew a domain.",
        params: {
          domain: {
            type: "string",
          },
        },
      },
      {
        command: "/check [domain] [cool_alternatives]",
        triggers: ["/check"],
        handler: handleEns,
        description: "Check if a domain is available.",
        params: {
          domain: {
            type: "string",
          },
          cool_alternatives: {
            type: "quoted",
          },
        },
      },
      {
        command: "/tip [address]",
        description: "Show a URL for tipping a domain owner.",
        triggers: ["/tip"],
        handler: ensAgent,
        params: {
          address: {
            type: "address",
          },
        },
      },
    ],
  },
];
