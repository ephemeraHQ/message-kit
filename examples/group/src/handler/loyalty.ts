import { HandlerContext, User } from "@xmtp/message-kit";
import { getStackClient } from "../lib/stack.js";

export async function handler(context: HandlerContext, fake?: boolean) {
  const stack = getStackClient();
  const {
    members,
    group,
    getMessageById,
    message: {
      content,
      content: { command },
      sender,
      typeId,
    },
  } = context;
  console.log(command);
  if (typeId === "text" && group) {
    const { command } = content;
    if (command === "points") {
      const points = await stack?.getPoints(sender.address);
      context.reply(`You have ${points} points`);
      return;
    } else if (command === "leaderboard") {
      const leaderboard = await stack?.getLeaderboard();
      const formattedLeaderboard = leaderboard?.leaderboard
        .map(
          (entry, index) =>
            `${index + 1}. Address: ${`${entry.address.slice(
              0,
              6,
            )}...${entry.address.slice(-4)}`}, Points: ${entry.points}`,
        )
        .join("\n");
      context.reply(
        `Leaderboard:\n\n${formattedLeaderboard}\n\nCheck out the public leaderboard\nhttps://www.stack.so/leaderboard/degen-group`,
      );
      return;
    }
  } else if (typeId === "group_updated" && group) {
    const { initiatedByInboxId, addedInboxes } = content;
    const adminAddress = members?.find(
      (member: User) => member.inboxId === initiatedByInboxId,
    );
    if (addedInboxes && addedInboxes.length > 0) {
      //if add someone to the group
      await stack?.track("referral", {
        points: 10,
        account: adminAddress?.address ?? "",
        uniqueId: adminAddress?.username ?? "",
      });
    }
  } else if (typeId === "reaction" && group) {
    const { content: emoji, action } = content;
    const msg = await getMessageById(content.reference);
    if (action === "added") {
      const adminAddress = members?.find(
        (member: User) => member.inboxId === msg?.senderInboxId,
      );
      let points = 1;
      if (emoji === "👎") {
        points = -10;
      } else if (emoji === "🎩") {
        points = 10;
      }
      await stack?.track("reaction", {
        points,
        account: adminAddress?.address ?? "",
        uniqueId: adminAddress?.username ?? "",
      });
    }
  }
}
