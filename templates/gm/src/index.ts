import { run, HandlerContext } from "@xmtp/message-kit";
run(async (context: HandlerContext) => {
  // To reply, just call `reply` on the HandlerContext
  await context.send(`gm`);
});
