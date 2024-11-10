import { run, HandlerContext } from "@xmtp/message-kit";

// Main function to run the app
run(async (context: HandlerContext) => {
  const { group } = context;

  if (!group) {
    context.send(
      "This This bot only works in group chats. Please add this bot to a group to continue",
    );
  }
});
