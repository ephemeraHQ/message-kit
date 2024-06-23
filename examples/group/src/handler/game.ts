import { HandlerContext } from "message-kit";

// Handler function to process game-related commands
export async function handler(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;

  // URLs for each game type
  const gameUrls: { [key: string]: string } = {
    wordle: "https://openframedl.vercel.app/",
    slot: "https://slot-machine-frame.vercel.app/",
  };
  // Respond with the appropriate game URL or an error message
  switch (params.type) {
    case "wordle":
    case "slot":
      // Retrieve the URL for the requested game using a simplified variable assignment
      const gameUrl = gameUrls[params.type];
      // Send the URL for the requested game
      context.reply(gameUrl);
      break;
    default:
      // Inform the user about unrecognized commands and provide available options
      context.reply(
        "Command not recognized. Available games: wordle, slot, or help.",
      );
  }
}
