import { handler as tipping } from "./handler/tipping.js";
import { handler as agent } from "./handler/agent.js";
import { handler as transaction } from "./handler/transaction.js";
import { handler as games } from "./handler/game.js";
import { handler as loyalty } from "./handler/loyalty.js";
import { handler as groupHelp } from "./handler/helpers.js";
import type { SkillGroup } from "@xmtp/message-kit";

export const skills: SkillGroup[] = [
  {
    name: "Tipping",
    description: "Tip tokens via emoji, replies or command.",
    skills: [
      {
        command: "/tip [@usernames] [amount] [token]",
        triggers: ["/tip"],
        examples: ["/tip @vitalik 10 usdc"],
        description: "Tip users in a specified token.",
        handler: tipping,
        params: {
          username: {
            default: "",
            plural: true,
            type: "username",
          },
          amount: {
            default: 10,
            type: "number",
          },
        },
      },
    ],
  },

  {
    name: "Transactions",
    description: "Multipurpose transaction frame built onbase.",
    skills: [
      {
        command: "/send [amount] [token] [username]",
        triggers: ["/send"],
        examples: ["/send 10 usdc @vitalik"],
        description:
          "Send a specified amount of a cryptocurrency to a destination address.",
        handler: transaction,
        params: {
          amount: {
            default: 10,
            type: "number",
          },
          token: {
            default: "usdc",
            type: "string",
            values: ["eth", "dai", "usdc", "degen"], // Accepted tokens
          },
          username: {
            default: "",
            type: "username",
          },
        },
      },
      {
        command: "/swap [amount] [token_from] [token_to]",
        triggers: ["/swap"],
        examples: ["/swap 10 usdc eth"],
        description: "Exchange one type of cryptocurrency for another.",
        handler: transaction,
        params: {
          amount: {
            default: 10,
            type: "number",
          },
          token_from: {
            default: "usdc",
            type: "string",
            values: ["eth", "dai", "usdc", "degen"], // Accepted tokens
          },
          token_to: {
            default: "eth",
            type: "string",
            values: ["eth", "dai", "usdc", "degen"], // Accepted tokenss
          },
        },
      },
      {
        command: "/show",
        triggers: ["/show"],
        examples: ["/show"],
        handler: transaction,
        description: "Show the whole frame.",
        params: {},
      },
    ],
  },
  {
    name: "Games",
    description: "Provides various gaming experiences.",
    skills: [
      {
        command: "/game [game]",
        triggers: ["/game", "🔎", "🔍"],
        handler: games,
        description: "Play a game.",
        params: {
          game: {
            default: "",
            type: "string",
            values: ["wordle", "slot", "help"],
          },
        },
      },
    ],
  },
  {
    name: "Agent",
    description: "Manage agent commands.",
    skills: [
      {
        command: "/agent [prompt]",
        triggers: ["/agent", "@agent", "@bot"],
        examples: ["/agent @vitalik"],
        handler: agent,
        description: "Manage agent commands.",
        params: {
          prompt: {
            default: "",
            type: "prompt",
          },
        },
      },
    ],
  },
  {
    name: "Help",
    description: "Get help with the bot.",
    skills: [
      {
        command: "/help",
        triggers: ["/help"],
        examples: ["/help"],
        handler: groupHelp,
        description: "Get help with the bot.",
        params: {},
      },
      {
        command: "/id",
        adminOnly: true,
        handler: groupHelp,
        triggers: ["/id"],
        description: "Get the group ID.",
        params: {},
      },
    ],
  },
];
