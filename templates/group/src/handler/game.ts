import { HandlerContext } from "@xmtp/message-kit";

// Handler function to process game-related
export async function handler(context: HandlerContext) {
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
  // Respond with the appropriate game URL or an error message
  switch (params.game) {
    case "wordle":
    case "slot":
      // Retrieve the URL for the requested game using a simplified variable assignment
      const gameUrl = gameUrls[params.game];
      // Send the URL for the requested game
      context.send(gameUrl);
      break;

    case "help":
      context.send("Available games: \n/game wordle\n/game slot");
      break;
    default:
      // Inform the user about unrecognized skills and provide available options
      context.send(
        "Skill not recognized. Available games: wordle, slot, or help.",
      );
  }
}
