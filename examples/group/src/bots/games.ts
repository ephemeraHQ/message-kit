import { run, HandlerContext } from "@xmtp/botkit";
import { extractCommandValues } from "../lib/helper.js";

const commandConfig = {
  framedl: { params: {} },
  slot: { params: {} },
  guess: { params: {} },
  help: { params: {} },
};

export async function handler(context: HandlerContext) {
  const { content } = context.message;
  const extracted = extractCommandValues(content, commandConfig);

  const baseUrlMap = {
    framedl: "https://openframedl.vercel.app/",
    slot: "https://slot-machine-frame.vercel.app/",
    guess: "https://farguessr.vercel.app/",
  };

  switch (extracted.command) {
    case "framedl":
    case "slot":
    case "guess":
      context.reply(baseUrlMap[extracted.command as keyof typeof baseUrlMap]);
      break;
    case "help":
      context.reply("Available games: framedl, slot, guess.");
      break;
    default:
      context.reply(
        "Command not recognized. Available games: framedl, slot, guess or help.",
      );
  }
}
