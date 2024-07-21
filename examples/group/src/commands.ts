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
        command: "/bet @users [name] [amount] [token]",
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
          token: {
            default: "eth",
            type: "string",
            values: ["eth", "dai", "usdc", "degen"],
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
        command: "/game [game]",
        description: "Play a game.",
        params: {
          game: {
            default: "",
            type: "string",
            values: ["wordle", "slot", "guessr", "rockpaperscissors", "help"],
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
];
