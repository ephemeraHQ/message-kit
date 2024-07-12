import { StackClient } from "@stackso/js-core";
import { HandlerContext } from "@xmtp/message-kit";

// Initialize the client
const stack = new StackClient({
  // Get your API key and point system id from the Stack dashboard (stack.so)
  apiKey: "45363d49-0d5b-4219-8a74-23a73fdc4981",
  pointSystemId: 2893,
});

export async function handler(context: HandlerContext) {
  const {
    members,
    getMessageById,
    message: { content, sender, typeId },
  } = context;
  console.log(content, sender);
  if (typeId === "text") {
    const {
      command,
      params: { type },
    } = content;
    if (command === "points") {
      if (type === "me") {
        const points = await stack.getPoints(sender.address);
        await context.reply(`You have ${points} points`);
      } else if (type === "leaderboard") {
        const leaderboard = await stack.getLeaderboard();
        console.log(leaderboard);
        const formattedLeaderboard = leaderboard.leaderboard
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
      await stack.track("referral", {
        points: 10,
        account: adminAddress ?? "",
      });
      console.log("Referral tracked", initiatedByInboxId);
    }
  } else if (typeId === "reaction") {
    console.log("loyalty handler", content);
    const msg = await getMessageById(content.reference);

    const adminAddress = members?.find(
      (member) => member.inboxId === msg?.senderInboxId,
    )?.address;
    await stack.track("reaction", {
      points: 1,
      account: adminAddress ?? "",
    });
    console.log("Reaction tracked", msg?.senderInboxId);
  }
}
