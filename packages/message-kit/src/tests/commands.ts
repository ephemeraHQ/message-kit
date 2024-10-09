import type { CommandGroup } from "../helpers/types";

export const commands: CommandGroup[] = [
  {
    name: "Tipping",
    description: "Tip tokens via emoji, replies or command.",
    triggers: ["/tip", "🎩", "@tip"],
    commands: [
      {
        command: "/tip [@users] [amount] [token]",
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
    triggers: ["@send", "/send", "@swap", "/swap", "/show"],
    description: "Multipurpose transaction frame built onbase.",
    commands: [
      {
        command: "/send [amount] [token] [@username]",
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
        handler: undefined,
        description: "Show the whole frame.",
        params: {},
      },
    ],
  },
  {
    name: "Games",
    triggers: ["/game", "@game", "🔎", "🔍"],
    description: "Provides various gaming experiences.",
    commands: [
      {
        command: "/game [game]",
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
    triggers: ["/points", "@points", "/leaderboard", "@leaderboard"],
    description: "Manage group members and metadata.",
    commands: [
      {
        command: "/points",
        handler: undefined,
        description: "Check your points.",
        params: {},
      },
      {
        command: "/leaderboard",
        handler: undefined,
        description: "Check the points of a user.",
        params: {},
      },
    ],
  },
  {
    name: "Agent",
    triggers: ["/agent", "@agent"],
    description: "Manage agent commands.",
    commands: [
      {
        command: "/agent [prompt]",
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
    name: "Split Payments",
    image: true,
    triggers: [],
    description: "Split payments between users.",
    commands: [],
  },
  {
    name: "Help",
    triggers: ["/help"],

    description: "Get help    with the bot.",
    commands: [
      {
        command: "/help",
        handler: undefined,
        description: "Get help with the bot.",
        params: {},
      },
    ],
  },
];
