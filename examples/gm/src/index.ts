import "dotenv/config";
import { run, HandlerContext } from "@xmtp/message-kit";

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender.
  const { typeId } = context.message;
  if (typeId === "text") {
    await context.reply(`gm`);
  }
});
