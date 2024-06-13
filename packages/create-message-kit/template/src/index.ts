import "dotenv/config";
import { run, HandlerContext } from "@xmtp/message-kit";

run(async (context: HandlerContext) => {
  const { content, senderAddress } = context.message;

  //Send the message
  await context.reply("gm");
});
