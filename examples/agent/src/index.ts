import { run, HandlerContext } from "@xmtp/message-kit";
import { handleEns, ensAgent } from "./handler/ens.js";

run(async (context: HandlerContext) => {
  const {
    message: {
      typeId,
      content: { content: text, command, params },
    },
    group,
  } = context;
  if (group) return;
  if (typeId !== "text") return;

  if (text.startsWith("/")) {
    await handleEns(context);
    return;
  }
  await ensAgent(context);
});
