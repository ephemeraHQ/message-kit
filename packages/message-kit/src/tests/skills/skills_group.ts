import type { SkillGroup } from "../../helpers/types.js";

let tipping = undefined;
let transaction = undefined;
let games = undefined;
let help = undefined;

export const skills: SkillGroup[] = [
  {
    name: "Group bot",
    tag: "@bot",
    description: "Group bot for tipping and transactions.",
    skills: [
      {
        skill: "/tip [usernames] [amount] [token]",
        triggers: ["/tip"],
        examples: ["/tip @vitalik 10 usdc"],
        description: "Tip users in a specified token.",
        handler: tipping,
        params: {
          username: {
            default: "",
            plural: true,
            type: "username",
          },
          amount: {
            default: 10,
            type: "number",
          },
        },
      },
      {
        skill: "/send [amount] [token] [username]",
        triggers: ["/send"],
        examples: ["/send 10 usdc @vitalik"],
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
        skill: "/swap [amount] [token_from] [token_to]",
        triggers: ["/swap"],
        examples: ["/swap 10 usdc eth"],
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
        skill: "/show",
        triggers: ["/show"],
        examples: ["/show"],
        handler: transaction,
        description: "Show the whole frame.",
        params: {},
      },
      {
        skill: "/game [game]",
        triggers: ["/game", "🔎", "🔍"],
        handler: games,
        description: "Play a game.",
        examples: ["/game wordle", "/game slot", "/game help"],
        params: {
          game: {
            default: "",
            type: "string",
            values: ["wordle", "slot", "help"],
          },
        },
      },
      {
        skill: "/help",
        triggers: ["/help"],
        examples: ["/help"],
        handler: help,
        description: "Get help with the bot.",
        params: {},
      },
      {
        skill: "/id",
        adminOnly: true,
        examples: ["/id"],
        handler: help,
        triggers: ["/id"],
        description: "Get the group ID.",
        params: {},
      },
    ],
  },
];
