import "dotenv/config";
import { run, HandlerContext } from "@xmtp/message-kit";
import { commands } from "./commands.js";

const appConfig = {
  commands: commands,
};

run(async (context: HandlerContext) => {
  const { content, sender } = context.message;

  /* Your logic*/

  //Send the message
  await context.reply("gm");
}, appConfig);
