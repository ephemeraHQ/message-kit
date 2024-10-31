import { run, HandlerContext } from "@xmtp/message-kit";
import { ensAgent, clearChatHistory, handleEns } from "./handler/ens.js";

run(async (context: HandlerContext) => {
  const {
    message: {
      content: { content: text },
      typeId,
    },
  } = context;
  if (typeId !== "text") return;
  const lowerContent = text?.toLowerCase();

  if (lowerContent.startsWith("/reset")) {
    clearChatHistory();
  }
  await ensAgent(context);
});
