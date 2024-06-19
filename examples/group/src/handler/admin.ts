import { HandlerContext } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const { conversation: group } = context;
  const { content } = context.message;
  const { command, params } = content;
  console.log(params);

  const userArrays = params.username
    .filter((user: any) => user.inboxId)
    .map((user: any) => user.inboxId);

  switch (command) {
    case "remove":
      await group.removeMembersByInboxId(userArrays);
      context.reply("User removed");
      break;
    case "add":
      await group.addMembersByInboxId(userArrays);
      context.reply("User added");
      break;
    case "addAdmin":
      for (const inboxId of userArrays) {
        await group.addAdmin(inboxId);
      }
      context.reply("Admin added");
      break;
    case "removeAdmin":
      for (const inboxId of userArrays) {
        await group.removeAdmin(inboxId);
      }
      context.reply("Admin removed");
      break;
    default:
      context.reply(
        "Command not recognized. Available commands: block, unblock, add, addAdmin, removeAdmin.",
      );
  }
}
