import type { HandlerContext } from "@xmtp/message-kit";

export const handler = async (context: HandlerContext) => {
  await context.send("gm");
};
