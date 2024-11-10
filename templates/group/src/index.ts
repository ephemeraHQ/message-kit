import { run, HandlerContext } from "@xmtp/message-kit";

// Main function to run the app
run(async (context: HandlerContext) => {
  const {
    message: { typeId },
    group,
  } = context;

  if (!group) {
    context.send("This is a group bot, add this address to a group");
  }
});
