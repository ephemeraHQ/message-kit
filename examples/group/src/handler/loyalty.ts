import { StackClient } from "@stackso/js-core";
import { HandlerContext } from "@xmtp/message-kit";

// Initialize the client
let stack: StackClient | null = null;

if (process?.env?.STACKS_API_KEY) {
  stack = new StackClient({
    // Get your API key and point system id from the Stack dashboard (stack.so)
    apiKey: process?.env?.STACKS_API_KEY as string,
    pointSystemId: 2893,
  });
}

export async function handler(context: HandlerContext) {
  if (!process?.env?.STACKS_API_KEY) {
    return context.reply("No Stacks API key found");
  }

  const {
    members,
    getMessageById,
    message: { content, sender, typeId },
  } = context;

  if (typeId === "text") {
    const {
      command,
      params: { type },
    } = content;
    if (command === "points") {
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
  }

  if (typeId === "group_updated") {
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
      console.log(emoji);
      console.log(emoji === "👎");
      if (emoji === "👎") {
        points = -10;
      } else if (emoji === "🎩") {
        points = 10;
      }
      console.log("points", points);
      await stack?.track("reaction", {
        points,
        account: adminAddress ?? "",
      });
    }
  }
}
