export const commands = [
  {
    name: "DegenBot",
    icon: "🎩",
    description: "Send degen tipping via emoji, replies or command.",
    commands: [
      {
        command: "/tip [@users] [amount] [token]",
        description: "Tip users in degen.",
        params: {
          username: {
            default: "",
            type: "username",
          },
          amount: {
            default: 10,
            type: "number",
          },
          token: {
            default: "degen",
            type: "string",
            values: ["degen"], // Accepted tokens
          },
        },
      },
    ],
  },
  {
    name: "BaseFrame",
    icon: "🖼️",
    description: "Multipurpose transaction frame.",
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
          collection_address: {
            default: "0x1234567890",
            type: "string",
          },
          token_id: {
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
    name: "BaseBet",
    icon: "🤖",
    description: "Betting on basebet.",
    commands: [
      {
        command: "/bet @users [Bet Name] [Bet Amount]",
        description: "Bet on basebet.",
        params: {
          users: {
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
    name: "GamesBot",
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
            values: ["wordle", "slot", "guess"],
          },
        },
      },
    ],
  },
  {
    name: "GeneralCommands",
    icon: "⚙️",
    description:
      "General utility commands for user management and information.",
    commands: [
      { command: "/tx", description: "Transaction primitive deeplink." },
      { command: "/dm", description: "Dm primitive." },
      { command: "/block", description: "Block a user." },
      { command: "/unblock", description: "Unblock a user." },
      { command: "/help", description: "Show available commands." },
    ],
  },
];
