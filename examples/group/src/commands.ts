import type { CommandGroup, CommandConfig } from "@xmtp/message-kit";
import { handler as tipping } from "./handler/tipping.js";
import { handler as agent } from "./handler/agent.js";
import { handler as transaction } from "./handler/transaction.js";
import { handler as splitpayment } from "./handler/payment.js";
import { handler as games } from "./handler/game.js";
import { handler as admin } from "./handler/admin.js";
import { handler as loyalty } from "./handler/loyalty.js";

export const commands: CommandGroup[] = [
  {
    name: "Tipping",
    icon: "🎩",
    description: "Tip tokens via emoji, replies or command.",
    commands: [
      {
        root: "/tip",
        tag: "@tip",
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
    tag: "@base",
    description: "Multipurpose transaction frame built onbase.",
    commands: [
      {
        command: "/send [amount] [token] [@username]",
        description:
          "Send a specified amount of a cryptocurrency to a destination address.",
        root: "/send",
        handler: transaction,
        tag: "@send",
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
        command: "/mint [collection_address] [token_id]",
        description: "Create (mint) a new token or NFT.",
        root: "/mint",
        handler: transaction,
        tag: "@mint",
        params: {
          collection: {
            default: "0x73a333cb82862d4f66f0154229755b184fb4f5b0",
            type: "address",
          },
          tokenId: {
            default: 1,
            type: "number",
          },
        },
      },
      {
        command: "/show",
        description: "Show the whole frame.",
        params: {},
      },
    ],
  },
  {
    name: "Games",
    icon: "🕹️",
    description: "Provides various gaming experiences.",
    commands: [
      {
        command: "/game [game]",
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
    description: "Manage group members and metadata.",
    commands: [
      {
        command: "/points",
        description: "Check your points.",
        params: {},
      },
      {
        command: "/leaderboard",
        description: "Check the points of a user.",
        params: {},
      },
    ],
  },
  {
    name: "Agent",
    icon: "🤖",
    description: "Manage agent commands.",
    commands: [
      {
        command: "/agent [prompt]",
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
    description: "Manage group members and metadata.",
    commands: [
      {
        command: "/add [username]",
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
    description: "Get help    with the bot.",
    commands: [
      {
        command: "/help",
        root: "/help",
        description: "Get help with the bot.",
        params: {},
      },
    ],
  },
];
