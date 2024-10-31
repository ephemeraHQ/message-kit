import { run, HandlerContext } from "@xmtp/message-kit";
import { ensAgent } from "./handler/ens.js";

run(async (context: HandlerContext) => {
  await ensAgent(context);
});
