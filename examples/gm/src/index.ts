import "dotenv/config";
import { run, HandlerContext } from "@xmtp/message-kit";

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender
  const {
    message: { content: text, senderInboxId, typeId },
  } = context;

  // Do something with content

  await context.reply(`gm`);
});
