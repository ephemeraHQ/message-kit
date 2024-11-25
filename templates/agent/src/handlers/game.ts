import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";

export const registerSkill: Skill[] = [
  {
    skill: "/game [game]",
    handler: handler,
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
];

export async function handler(context: XMTPContext) {
  const {
    message: {
      content: { skill, params, text },
    },
  } = context;
  if (!skill) {
    if (text === "🔎" || text === "🔍") {
      // Send the URL for the requested game
      context.reply("https://framedl.xyz/");
    }
    return;
  }
  // URLs for each game type
  const gameUrls: { [key: string]: string } = {
    wordle: "https://framedl.xyz",
    slot: "https://slot-machine-frame.vercel.app",
  };
  let returnText = "";
  switch (params.game) {
    case "wordle":
    case "slot":
      // Retrieve the URL for the requested game using a simplified variable assignment
      const gameUrl = gameUrls[params.game];
      // Send the URL for the requested game
      returnText = gameUrl;
      break;

    case "help":
      returnText = "Available games: \n/game wordle\n/game slot";
      break;
    default:
      // Inform the user about unrecognized skills and provide available options
      returnText =
        "Skill not recognized. Available games: wordle, slot, or help.";
      break;
  }
  return { code: 200, message: returnText };
}
