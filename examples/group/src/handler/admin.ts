import { HandlerContext as HandlerContext } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const { content } = context.message;
  const { command, params } = content;
  switch (command) {
    case "block":
      // context.addMember(params.username);
      context.reply("❌ you are not an admin");
      break;
    case "unblock":
      // context.removeMember(params.username);
      context.reply("❌ you are not an admin");
      break;
    default:
      // Inform the user about unrecognized commands and provide available options
      context.reply(
        "Command not recognized. Available commands: block, unblock.",
      );
  }
}
