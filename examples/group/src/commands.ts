import type { CommandGroup } from "@xmtp/message-kit";
import { handler as tipping } from "./handler/tipping.js";
import { handler as agent } from "./handler/agent.js";
import { handler as transaction } from "./handler/transaction.js";
import { handler as games } from "./handler/game.js";
import { handler as loyalty } from "./handler/loyalty.js";
import { helpHandler } from "./index.js";

export const commands: CommandGroup[] = [
  {
    name: "Tipping",
    description: "Tip tokens via emoji, replies or command.",
    commands: [
      {
        command: "/tip [@users] [amount] [token]",
        triggers: ["/tip", "🎩", "@tip"],
        description: "Tip users in a specified token.",
        handler: tipping,
        params: {
          username: {
            default: "",
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
    commands: [
      {
        command: "/send [amount] [token] [@username]",
        triggers: ["@send", "/send"],
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
        triggers: ["@swap", "/swap"],
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
        handler: transaction,
        description: "Show the whole frame.",
        params: {},
      },
    ],
  },
  {
    name: "Games",
    description: "Provides various gaming experiences.",
    commands: [
      {
        command: "/game [game]",
        triggers: ["/game", "@game", "🔎", "🔍"],
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
    name: "Loyalty",
    description: "Manage group members and metadata.",
    commands: [
      {
        command: "/points",
        triggers: ["/points", "@points"],
        handler: loyalty,
        description: "Check your points.",
        params: {},
      },
      {
        command: "/leaderboard",
        triggers: ["/leaderboard", "@leaderboard"],
        adminOnly: true,
        handler: loyalty,
        description: "Check the points of a user.",
        params: {},
      },
    ],
  },
  {
    name: "Agent",
    description: "Manage agent commands.",
    commands: [
      {
        command: "/agent [prompt]",
        triggers: ["/agent", "@agent", "@bot"],
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
    name: "Split Payments",
    image: true,
    description: "Split payments between users.",
    commands: [],
  },
  {
    name: "Help",
    description: "Get help with the bot.",
    commands: [
      {
        command: "/help",
        triggers: ["/help"],
        handler: helpHandler,
        description: "Get help with the bot.",
        params: {},
      },
    ],
  },
];
