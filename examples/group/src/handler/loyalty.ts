import { HandlerContext, User } from "@xmtp/message-kit";
import { getStackClient, StackClient } from "../lib/stack.js";

export async function handler(context: HandlerContext, fake?: boolean) {
  const stack = getStackClient();
  const {
    members,
    getMessageById,
    message: { id, content, sender, typeId },
  } = context;
  if (fake && stack) {
    //for fake demo
    fakeReaction(sender.username, sender.address, id, stack, context);
    return;
  } else if (typeId === "text") {
    const { command } = content;
    if (command === "points") {
      const points = await stack?.getPoints(sender.address);
      context.reply(`You have ${points} points`);
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
    }
  } else if (typeId === "group_updated") {
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
  } else if (typeId === "reaction") {
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
async function fakeReaction(
  username: string,
  address: string,
  id: string,
  stack: StackClient,
  context: HandlerContext,
) {
  if (username === "me") {
    if (Math.random() < 0.1) {
      //Fake reactions
      const emojis = ["😀", "👍", "🎩", "🐐", "🔥"];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      context.react(randomEmoji);
      let points = 1;
      if (randomEmoji === "🎩") {
        points = 10;
      }
      await stack?.track("reaction", {
        points,
        account: address,
      });
    }
  }
}
