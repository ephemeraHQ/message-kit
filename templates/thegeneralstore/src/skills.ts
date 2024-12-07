import type { Agent } from "@xmtp/message-kit";
import { handlePoap } from "./skills/poap.js";
import { handleFaucet } from "./skills/faucet.js";
import { handleNotion } from "./skills/notion.js";

export const agent: Agent = {
  name: "Poap Bot",
  description: "Get your POAP.",
  tag: "@store",
  skills: [
    {
      skill: "/poap [address]",
      handler: handlePoap,
      examples: ["/poap 0x1234567890123456789012345678901234567890"],
      description: "Get your POAP.",
      params: {
        address: {
          type: "string",
        },
      },
    },
    {
      skill: "/list",
      handler: handlePoap,
      examples: ["/list"],
      description: "List all POAPs.",
      params: {},
    },
    {
      skill: "/update",
      handler: handleNotion,
      examples: ["/update"],
      description: "Update your Notion prompt.",
      params: {},
    },
  ],
};
