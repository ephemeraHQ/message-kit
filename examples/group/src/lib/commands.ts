export const commands = [
  {
    name: "DegenBot",
    icon: "🎩",
    description: "Send degen tipping via emoji, replies or command.",
    commands: [
      {
        command: "/tip [@users] [amount] [token]",
        description: "Tip users in degen.",
      },
    ],
  },
  {
    name: "BaseFrame",
    icon: "🖼️",
    description: "Multipurpose transaction frame.",
    commands: [
      {
        command: "/baseframe send [amount] [token] [@username]",
        description:
          "Send a specified amount of a cryptocurrency to a destination address.",
      },
      {
        command: "/baseframe swap [amount] [token_from] [token_to]",
        description: "Exchange one type of cryptocurrency for another.",
      },
      {
        command: "/baseframe mint [collection_address] [token_id]",
        description: "Create (mint) a new token or NFT.",
      },
      { command: "/baseframe help", description: "Display this help message." },
      { command: "/baseframe show", description: "Show the whole frame." },
    ],
  },
  {
    name: "BaseBet",
    icon: "🤖",
    description: "Betting on basebet.",
    commands: [
      {
        command: "/basebet bet @users [Bet Name] [Bet Amount]",
        description: "Bet on basebet.",
      },
    ],
  },
  {
    name: "GamesBot",
    icon: "🕹️",
    description: "Provides various gaming experiences.",
    commands: [
      { command: "/games framedl", description: "World game." },
      { command: "/games slot", description: "Play the Slot Machine." },
      { command: "/games guess", description: "Guess game." },
      { command: "/games help", description: "Show available games." },
    ],
  },
  {
    name: "GeneralCommands",
    icon: "⚙️",
    description:
      "General utility commands for user management and information.",
    commands: [
      { command: "/tx", description: "Transaction primitive deeplink." },
      { command: "/block", description: "Block a user." },
      { command: "/unblock", description: "Unblock a user." },
      { command: "/help", description: "Show available commands." },
    ],
  },
];
