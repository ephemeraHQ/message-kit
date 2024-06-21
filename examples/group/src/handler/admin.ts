import { HandlerContext } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const {
    conversation,
    members,
    message: {
      content: {
        params: { type, username, address },
      },
    },
  } = context;

  switch (type) {
    case "remove":
      const userArrays = username.filter((user: any) => user.address);
      await conversation.sync();
      const removed = await conversation.removeMembers(userArrays);
      context.reply("User removed");
      console.log(removed);
      break;
    case "add":
      await conversation.sync();
      console.log(address);
      const added = await conversation.addMembers([address]);
      context.reply("User added");
      console.log(added);
      break;
  }
}
