import type { CommandGroup } from "@xmtp/message-kit";
import { handler as tipping } from "./handler/tipping.js";
import { handler as agent } from "./handler/agent.js";
import { handler as transaction } from "./handler/transaction.js";
import { handler as games } from "./handler/game.js";
import { handler as loyalty } from "./handler/loyalty.js";

export const commands: CommandGroup[] = [
  {
    name: "Tipping",
    description: "Tip tokens via emoji, replies or command.",
    triggers: ["/tip", "🎩", "@tip"],
    commands: [
      {
        command: "/tip [@users] [amount] [token]",
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
    triggers: ["@send", "/send", "@swap", "/swap", "/show"],
    description: "Multipurpose transaction frame built onbase.",
    commands: [
      {
        command: "/send [amount] [token] [@username]",
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
        handler: transaction,
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
    triggers: ["/points", "@points", "/leaderboard", "@leaderboard"],
    description: "Manage group members and metadata.",
    commands: [
      {
        command: "/points",
        handler: loyalty,
        description: "Check your points.",
        params: {},
      },
      {
        command: "/leaderboard",
        handler: loyalty,
        description: "Check the points of a user.",
        params: {},
      },
    ],
  },
  {
    name: "Agent",
    triggers: ["/agent", "@agent", "@bot"],
    description: "Manage agent commands.",
    commands: [
      {
        command: "/agent [prompt]",
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
