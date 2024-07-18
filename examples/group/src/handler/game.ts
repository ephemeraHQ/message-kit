import { HandlerContext } from "@xmtp/message-kit";

// Handler function to process game-related commands
export async function handler(context: HandlerContext) {
  const {
    message: {
      content: {
        command,
        params: { game },
      },
    },
  } = context;
  console.log("command", command, game);
  // URLs for each game type
  const gameUrls: { [key: string]: string } = {
    wordle: "https://openframedl.vercel.app/",
    slot: "https://slot-machine-frame.vercel.app/",
  };

  // Respond with the appropriate game URL or an error message
  switch (game) {
    case "wordle":
    case "slot":
      // Retrieve the URL for the requested game using a simplified variable assignment
      const gameUrl = gameUrls[game];
      // Send the URL for the requested game
      context.reply(gameUrl);
      break;
    case "help":
      context.reply("Available games: \n/game wordle\n/game slot");
      break;
    default:
      // Inform the user about unrecognized commands and provide available options
      context.reply(
        "Command not recognized. Available games: wordle, slot, or help.",
      );
  }
}
