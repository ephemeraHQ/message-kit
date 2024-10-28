import type { CommandGroup } from "../helpers/types";

export const commands: CommandGroup[] = [
  {
    name: "Tipping",
    description: "Tip tokens via emoji, replies or command.",
    commands: [
      {
        command: "/tip [@users] [amount] [token]",
        triggers: ["/tip", "🎩", "@tip"],
        description: "Tip users in a specified token.",
        handler: undefined,
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
        handler: undefined,
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
        handler: undefined,
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
        handler: undefined,
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
        handler: undefined,
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
        handler: undefined,
        description: "Check your points.",
        params: {},
      },
      {
        command: "/leaderboard",
        triggers: ["/leaderboard", "@leaderboard"],
        adminOnly: true,
        handler: undefined,
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
        handler: undefined,
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
    commands: [
      {
        command: "/help",
        triggers: ["/help"],
        handler: undefined,
        description: "Get help with the bot.",
        params: {},
      },
    ],
  },
];
