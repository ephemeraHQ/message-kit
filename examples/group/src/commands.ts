import type { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "Tipping",
    icon: "🎩",
    description: "Tip tokens via emoji, replies or command.",
    commands: [
      {
        command: "/tip [@users] [amount] [token]",
        description: "Tip users in a specified token.",
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
    description: "Multipurpose transaction frame built onbase.",
    commands: [
      {
        command: "/send [amount] [token] [@username]",
        description:
          "Send a specified amount of a cryptocurrency to a destination address.",
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
    name: "Betting",
    icon: "🎰",
    description: "Create bets with friends.",
    commands: [
      {
        command: "/bet @users [Bet Name] [Bet Amount]",
        description: "Bet on basebet.",
        params: {
          username: {
            default: "",
            type: "username",
          },
          name: {
            default: "",
            type: "quoted",
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
    name: "Games",
    icon: "🕹️",
    description: "Provides various gaming experiences.",
    commands: [
      {
        command: "/game [type]",
        description: "Play a game.",
        params: {
          type: {
            default: "",
            type: "string",
            values: ["wordle", "slot", "help"],
          },
        },
      },
    ],
  },
  {
    name: "Admin",
    icon: "🔐",
    description: "Moderate access to the group with admin commands.",
    commands: [
      {
        command: "/admin [type]",
        description: "Add or remove a user.",
        params: {
          type: {
            default: "",
            type: "string",
            values: ["add", "remove", "name"],
          },
          username: {
            default: "",
            type: "username",
          },
          address: {
            default: "",
            type: "address",
          },
          name: {
            default: "",
            type: "quoted",
          },
        },
      },
    ],
  },
];
