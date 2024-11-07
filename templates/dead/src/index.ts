import { HandlerContext, run } from "@xmtp/message-kit";

run(
  async (context: HandlerContext) => {
    context.send("gm");
  },
  {
    experimental: true,
    client: {
      logging: "off",
    },
  }
);
