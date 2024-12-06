import { run } from "@xmtp/message-kit";

run(async (context) => {
  await context.send(`gm`);
});
