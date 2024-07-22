import { HandlerContext } from "@xmtp/message-kit";
import type { User } from "@xmtp/message-kit";

// Reusable function to handle adding members
function handleAddMembers(
  addedInboxes: { inboxId: string }[],
  members: User[],
) {
  const addedNames = members
    ?.filter((member: User) =>
      addedInboxes.some(
        (added: { inboxId: string }) =>
          added?.inboxId?.toLowerCase() === member?.inboxId?.toLowerCase(),
      ),
    )
    .map((member: User) => `@${member.username}`)
    .filter((name: string) => name.trim() !== "@") // Filter out empty or undefined usernames
    .join(", "); // Join names for message formatting

  if (addedNames && addedNames.trim().length > 0) {
    let messages = [
      `Yo, ${addedNames}! 🫡`,
      `LFG ${addedNames}!`,
      `${addedNames}🤝`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  return "";
}
function handleRemoveMembers() {
  let messages = [`🪦`, `👻`, `hasta la vista, baby`];
  return messages[Math.floor(Math.random() * messages.length)];
}
const handleGroupname = (newValue: string, adminName: string) => {
  let messages = [`LFG ${newValue}! 🔥`, `all hail ${newValue} 👏🏻`];
  return messages[Math.floor(Math.random() * messages.length)];
};
export async function handler(context: HandlerContext) {
  const {
    conversation,
    members,
    message: { content, typeId, sender },
  } = context;
  if (typeId === "group_updated") {
    const {
      initiatedByInboxId,
      metadataFieldChanges,
      removedInboxes,
      addedInboxes,
    } = content;

    // Fetch username from members array mapped by inboxId
    const adminName =
      members?.find((member: User) => member.inboxId === initiatedByInboxId)
        ?.username || "Admin";

    let message: string = "";
    if (addedInboxes && addedInboxes.length > 0) {
      message += handleAddMembers(addedInboxes, members!);
    } else if (removedInboxes && removedInboxes.length > 0) {
      message += handleRemoveMembers();
    } else if (metadataFieldChanges && metadataFieldChanges[0]) {
      const { fieldName, newValue } = metadataFieldChanges?.[0];
      if (fieldName === "group_name") {
        message += handleGroupname(newValue, adminName);
      }
    }
    await context.reply(message);
  } else if (typeId === "text") {
    const {
      command,
      params: { username, name },
    } = content;
    switch (command) {
      case "name":
        try {
          await conversation.updateName(name);
          const messages = handleGroupname(name, sender.username);
          context.reply(messages);
        } catch (error) {
          context.reply("No admin privileges");
          console.error(error);
        }
        break;
      case "remove":
        try {
          const removedInboxes = username.map((user: User) => user.inboxId);
          if (!removedInboxes || removedInboxes.length === 0) {
            context.reply("Wrong username");
            return;
          }
          await conversation.sync();
          await conversation.removeMembersByInboxId(removedInboxes);
          const messages = handleRemoveMembers();
          context.reply(messages);
        } catch (error) {
          context.reply("Error: Check admin privileges");
          console.error(error);
        }
        break;
      case "add":
        try {
          const addedInboxes = username.map((user: User) =>
            user?.inboxId?.toLowerCase(),
          );
          if (!addedInboxes || addedInboxes.length === 0) {
            context.reply("Wrong username");
            return;
          }
          await conversation.sync();
          await conversation.addMembersByInboxId(addedInboxes);
          await conversation.sync();
          const messages = handleAddMembers(
            [{ inboxId: addedInboxes[0] }],
            members!,
          );
          context.reply(messages);
        } catch (error) {
          context.reply("Error: Check admin privileges");
          console.error(error);
        }
        break;
    }
  }
  return;
}
