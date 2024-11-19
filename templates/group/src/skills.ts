import { handleTipping } from "./handlers/tipping.js";
import { handlePay } from "./handlers/payment.js";
import { handleGames } from "./handlers/game.js";
import { handleHelp } from "./handlers/helpers.js";
import type { SkillGroup } from "@xmtp/message-kit";

export const skills: SkillGroup[] = [
  {
    name: "Group bot",
    tag: "@bot",
    description: "Group agent for tipping payments, games and more.",
    skills: [
      {
        skill: "/tip [usernames] [amount] [token]",
        examples: ["/tip @vitalik 10 usdc"],
        description: "Tip users in a specified token.",
        handler: handleTipping,
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
          token: {
            default: "usdc",
            type: "string",
            values: ["eth", "dai", "usdc", "degen"],
          },
        },
      },
      {
        skill: "/pay [amount] [token] [username]",
        examples: ["/pay 10 usdc vitalik.eth", "/pay 1 @alix"],
        description:
          "Send a specified amount of a cryptocurrency to a destination address.",
        handler: handlePay,
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
        skill: "/game [game]",
        handler: handleGames,
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
        examples: ["/help"],
        handler: handleHelp,
        description: "Get help with the bot.",
        params: {},
      },
      {
        skill: "/id",
        adminOnly: true,
        examples: ["/id"],
        handler: handleHelp,
        description: "Get the group ID.",
        params: {},
      },
    ],
  },
];
