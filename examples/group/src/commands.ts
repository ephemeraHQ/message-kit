import type { CommandGroup } from "@xmtp/message-kit";
import { handler as tipping } from "./handler/tipping.js";
import { handler as agent } from "./handler/agent.js";
import { handler as transaction } from "./handler/transaction.js";
import { handler as help } from "./handler/payment.js";
import { handler as games } from "./handler/game.js";
import { handler as admin } from "./handler/admin.js";
import { handler as loyalty } from "./handler/loyalty.js";

export const commands: CommandGroup[] = [
  {
    name: "Tipping",
    icon: "🎩",
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
    name: "Base Transactions",
    icon: "🖼️",
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
    icon: "🕹️",
    triggers: ["/game", "@game"],
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
    icon: "🔓",
    triggers: ["/points", "@points"],
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
    icon: "🤖",
    triggers: ["/agent", "@agent"],
    description: "Manage agent commands.",
    commands: [
      {
        command: "/ai [prompt]",
        handler: agent,
        description: "Manage agent commands.",
        params: {
          prompt: {
            default: "",
            type: "string",
          },
        },
      },
    ],
  },
  {
    name: "Admin",
    icon: "🔐",
    triggers: [
      "/admin",
      "@admin",
      "/add",
      "@add",
      "/remove",
      "@remove",
      "/name",
      "@name",
    ],
    description: "Manage group members and metadata.",
    commands: [
      {
        command: "/add [username]",
        handler: admin,
        description: "Add a user.",
        params: {
          username: {
            default: "",
            type: "username",
          },
        },
      },
      {
        command: "/remove [username]",
        handler: admin,
        description: "Remove a user.",
        params: {
          username: {
            default: "",
            type: "username",
          },
        },
      },
      {
        command: "/name [name]",
        handler: admin,
        description: "Set the name of the group.",
        params: {
          name: {
            default: "",
            type: "quoted",
          },
        },
      },
    ],
  },
  {
    name: "Help",
    icon: "🆘",
    triggers: ["/help"],

    description: "Get help    with the bot.",
    commands: [
      {
        command: "/help",
        handler: help,
        description: "Get help with the bot.",
        params: {},
      },
    ],
  },
];
