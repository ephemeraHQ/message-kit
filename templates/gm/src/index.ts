import { run, HandlerContext } from "@xmtp/message-kit";

run(async (context: HandlerContext) => {
  context.send("gm");
});
