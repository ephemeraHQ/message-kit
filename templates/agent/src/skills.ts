import { handleEns } from "./handler/ens.js";
import type { SkillGroup } from "@xmtp/message-kit";

export const skills: SkillGroup[] = [
  {
    name: "Ens Domain Bot",
    tag: "@ens",
    description: "Register ENS domains.",
    skills: [
      {
        command: "/register [domain]",
        triggers: ["/register"],
        handler: handleEns,
        description:
          "Register a new ENS domain. Returns a URL to complete the registration process.",
        example: "/register vitalik.eth",
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
        example: "/info nick.eth",
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
        example: "/renew fabri.base.eth",
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
        command: "/cool [domain]",
        triggers: ["/cool"],
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
        handler: handleEns,
        description: "Reset the conversation.",
        params: {},
      },
      {
        command: "/tip [address]",
        description: "Show a URL for tipping a domain owner.",
        triggers: ["/tip"],
        handler: handleEns,
        params: {
          address: {
            type: "string",
          },
        },
      },
    ],
  },
];
