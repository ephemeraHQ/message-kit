import type { HandlerContext } from "@xmtp/message-kit";

export const handler = async (context: HandlerContext) => {
  console.log("entra handler");
  await context.send("gm");
};
