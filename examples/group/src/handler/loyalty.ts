import { HandlerContext, User } from "@xmtp/message-kit";
import { getStackClient, StackClient } from "../lib/stack.js";

export async function handler(context: HandlerContext) {
  const stack = getStackClient();
  const {
    members,
    getMessageById,
    message: { id, content, sender, typeId },
  } = context;
  if (typeId === "text") {
    const { command, params } = content;
    if (command === "points" && params) {
      const { type } = params;
      if (type === "me") {
        const points = await stack?.getPoints(sender.address);
        await context.reply(`You have ${points} points`);
      } else if (type === "leaderboard") {
        const leaderboard = await stack?.getLeaderboard();
        const formattedLeaderboard = leaderboard?.leaderboard
          .map(
            (entry, index) =>
              `${index + 1}. Address: ${entry.address}, Points: ${entry.points}`,
          )
          .join("\n");
        await context.reply(`Leaderboard:\n${formattedLeaderboard}`);
      }
    }
    //for fake demo
    fakeReaction(sender.username, sender.address, id, stack, context);
  } else if (typeId === "group_updated") {
    const { initiatedByInboxId, addedInboxes } = content;
    const adminAddress = members?.find(
      (member) => member.inboxId === initiatedByInboxId,
    )?.address;
    if (addedInboxes && addedInboxes.length > 0) {
      //if add someone to the group
      await stack?.track("referral", {
        points: 10,
        account: adminAddress ?? "",
      });
    }
  } else if (typeId === "reaction") {
    const { content: emoji, action } = content;
    const msg = await getMessageById(content.reference);
    if (action === "added") {
      const adminAddress = members?.find(
        (member) => member.inboxId === msg?.senderInboxId,
      )?.address;
      let points = 1;
      if (emoji === "👎") {
        points = -10;
      } else if (emoji === "🎩") {
        points = 10;
      }
      await stack?.track("reaction", {
        points,
        account: adminAddress ?? "",
      });
    }
  }
}
async function fakeReaction(
  username: string,
  address: string,
  id: string,
  stack: StackClient,
  context: HandlerContext,
) {
  if (username === "me") {
    if (Math.random() < 0.3) {
      //Fake reactions
      const emojis = ["😀", "👍", "👎", "🎩"];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      context.sendReaction(randomEmoji, id);
      let points = 1;
      if (randomEmoji === "👎") {
        points = -10;
      } else if (randomEmoji === "🎩") {
        points = 10;
      }
      await stack?.track("reaction", {
        points,
        account: address,
      });
    }
  }
}
