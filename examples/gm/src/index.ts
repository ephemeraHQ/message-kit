import "dotenv/config";
import { run, HandlerContext } from "message-kit";

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender
  const { content, sender } = context.message;

  // To reply, just call `reply` on the HandlerContext.
  await context.reply(`gm`);
});
