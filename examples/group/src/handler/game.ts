import { HandlerContext } from "@xmtp/message-kit";

// Handler function to process game-related commands
export async function handler(context: HandlerContext) {
  const {
    message: {
      content: { command, params },
    },
  } = context;
  if (!command) {
    const { content: text } = context?.message?.content;
    if (text === "🔎" || text === "🔍") {
      // Send the URL for the requested game
      context.reply("https://framedl.xyz/");
    }
    return;
  }
  // URLs for each game type
  const gameUrls: { [key: string]: string } = {
    wordle: "https://framedl.xyz/",
    slot: "https://slot-machine-frame.vercel.app/",
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
      // Inform the user about unrecognized commands and provide available options
      context.send(
        "Command not recognized. Available games: wordle, slot, or help.",
      );
  }
}
