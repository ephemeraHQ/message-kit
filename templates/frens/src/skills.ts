import type { SkillGroup } from "@xmtp/message-kit";
import { handleEns } from "./handlers/ens.js";
import { handlePoap } from "./handlers/poap.js";
import { handleMembers } from "./handlers/members.js";

export const skills: SkillGroup[] = [
  {
    name: "Earl",
    tag: "@earl",
    description: "Earl manages all for the event",
    skills: [
      {
        command: "/subscribe",
        triggers: ["/subscribe"],
        handler: handleMembers,
        examples: ["/subscribe "],
        description: "Subscribe to updates.",
        params: {
          address: {
            type: "address",
          },
        },
      },
      {
        command: "/unsubscribe",
        triggers: ["/unsubscribe"],
        examples: ["/unsubscribe"],
        handler: handleMembers,
        description: "Unsubscribe to updates.",
        params: {
          address: {
            type: "address",
          },
        },
      },
      {
        command: "/add",
        adminOnly: true,
        handler: handleMembers,
        triggers: ["/add"],
        examples: ["/add"],
        description: "Add yourself to the group.",
        params: {},
      },
      {
        command: "/remove",
        adminOnly: true,
        handler: handleMembers,
        triggers: ["/remove"],
        examples: ["/remove"],
        description: "Remove yourself from the group.",
        params: {},
      },
      {
        command: "/id",
        adminOnly: true,
        handler: handleMembers,
        triggers: ["/id"],
        description: "Get the group ID.",
        params: {},
      },
      {
        command: "/exists",
        adminOnly: true,
        examples: ["/exists"],
        handler: handleMembers,
        triggers: ["/exists"],
        description: "Check if an address is onboarded.",
        params: {},
      },
      {
        command: "/status",
        adminOnly: true,
        triggers: ["/status"],
        examples: ["/status"],
        handler: handleMembers,
        description: "Get the status of the bot.",
        params: {},
      },
    ],
  },
  {
    name: "Kuzco",
    tag: "@kuzko",
    description: "Register ENS domains.",
    skills: [
      {
        command: "/register [domain]",
        triggers: ["/register"],
        handler: handleEns,
        description:
          "Register a new ENS domain. Returns a URL to complete the registration process.",
        examples: ["/register vitalik.eth"],
        params: {
          domain: {
            type: "string",
          },
        },
      },
      {
        command: "/info [domain]",
        triggers: ["/info"],
        handler: handleEns,
        description:
          "Get detailed information about an ENS domain including owner, expiry date, and resolver.",
        examples: ["/info nick.eth"],
        params: {
          domain: {
            type: "string",
          },
        },
      },
      {
        command: "/renew [domain]",
        triggers: ["/renew"],
        handler: handleEns,
        description:
          "Extend the registration period of your ENS domain. Returns a URL to complete the renewal.",
        examples: ["/renew fabri.base.eth"],
        params: {
          domain: {
            type: "string",
          },
        },
      },
      {
        command: "/check [domain]",
        triggers: ["/check"],
        handler: handleEns,
        examples: ["/check vitalik.eth", "/check fabri.base.eth"],
        description: "Check if a domain is available.",
        params: {
          domain: {
            type: "string",
          },
        },
      },
      {
        command: "/cool [domain]",
        triggers: ["/cool"],
        examples: ["/cool vitalik.eth"],
        handler: handleEns,
        description: "Get cool alternatives for a .eth domain.",
        params: {
          domain: {
            type: "string",
          },
        },
      },
      {
        command: "/reset",
        triggers: ["/reset"],
        examples: ["/reset"],
        handler: handleEns,
        description: "Reset the conversation.",
        params: {},
      },
      {
        command: "/tip [address]",
        description: "Show a URL for tipping a domain owner.",
        triggers: ["/tip"],
        handler: handleEns,
        examples: ["/tip 0x1234567890123456789012345678901234567890"],
        params: {
          address: {
            type: "string",
          },
        },
      },
    ],
  },
  {
    name: "Bittu",
    tag: "@bittu",
    description: "Bittu is the mascot of the event, delivers your poap",
    skills: [
      {
        command: "/poap [address]",
        triggers: ["/poap", "/sendbittu", "/removepoap"],
        handler: handlePoap,
        description: "Get your POAP.",
        params: {
          address: {
            type: "address",
          },
        },
      },
      {
        command: "/sendbittu [address]",
        triggers: ["/poap", "/sendbittu", "/removepoap"],
        handler: handlePoap,
        description: "Send Bittu to send a DM.",
        params: {
          address: {
            type: "address",
          },
        },
      },
      {
        command: "/removepoap [address]",
        triggers: ["/poap", "/sendbittu", "/removepoap"],
        handler: handlePoap,
        description: "Remove your POAP.",
        params: {
          address: {
            type: "address",
          },
        },
      },
    ],
  },
];
