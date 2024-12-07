import { run } from "@xmtp/message-kit";

run(async (context) => {
  const { group } = context;
  if (!group) {
    await context.send(`gm`);
  }
});
