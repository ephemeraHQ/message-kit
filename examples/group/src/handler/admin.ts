import { HandlerContext } from "@xmtp/message-kit";
import type { User } from "@xmtp/message-kit";

// Reusable function to handle adding members
function handleAddMembers(
  addedInboxes: { inboxId: string }[],
  members: User[],
  adminName: string,
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
function handleRemoveMembers(adminName: string) {
  let messages = [`🪦`, `☠️☠️☠️`, `👻`, `hasta la vista, baby`];
  return messages[Math.floor(Math.random() * messages.length)];
}
const handleGroupDescription = (newValue: string, adminName: string) => {
  let messages = [
    `The group description was just updated to '${newValue}'! 📝 Now @${adminName} is scrambling to update the smart contracts!`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};
const handleGroupImage = (newValue: string, adminName: string) => {
  let messages = [
    `The group image was just updated to '${newValue}'! 📝 Now @${adminName} is scrambling to update the smart contracts!`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};
const handleGroupname = (newValue: string, adminName: string) => {
  let messages = [
    `New name, new game '${newValue}'! 📝`,
    `Nothing will be the same, all hail '${newValue}'!`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};
export async function handler(context: HandlerContext) {
  const {
    conversation,
    members,
    message: { content, typeId, sender },
  } = context;
  logGroupUpdates(content);
  if (typeId === "group_updated") {
    const {
      initiatedByInboxId,
      metadataFieldChanges,
      removedInboxes,
      addedInboxes,
    } = content;

    // Fetch username from members array mapped by inboxId
    const adminName =
      members?.find((member) => member.inboxId === initiatedByInboxId)
        ?.username || "Admin";

    let message: string = "";
    if (addedInboxes && addedInboxes.length > 0) {
      message += handleAddMembers(addedInboxes, members!, adminName);
    } else if (removedInboxes && removedInboxes.length > 0) {
      message += handleRemoveMembers(adminName);
    } else if (metadataFieldChanges && metadataFieldChanges[0]) {
      const { fieldName, newValue } = metadataFieldChanges?.[0];
      if (fieldName === "group_name") {
        message += handleGroupname(newValue, adminName);
      } else if (fieldName === "group_description") {
        message += handleGroupDescription(newValue, adminName);
      } else if (fieldName === "group_image_url_square") {
        message += handleGroupImage(newValue, adminName);
      }
    }
    context.reply(message);
  } else if (typeId === "text") {
    const {
      params: { type, username, name },
    } = content;
    switch (type) {
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
          const messages = handleRemoveMembers(sender.username);
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
            sender.username,
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

function logGroupUpdates(content: any) {
  const {
    members,
    conversation,
    initiatedByInboxId,
    metadataFieldChanges,
    removedInboxes,
    addedInboxes,
  } = content;
  if (process?.env?.MSG_LOG === "true") {
    const adminName =
      members?.find((member: User) => member.inboxId === initiatedByInboxId)
        ?.username || "Admin";
    console.log(`${adminName} updated the group`, content);
  }
  if (addedInboxes?.length > 0) {
    for (const inbox of addedInboxes) {
      console.log(`User added: ${inbox.inboxId}`);
    }
  }

  if (removedInboxes?.length > 0) {
    for (const inbox of removedInboxes) {
      console.log(`User removed: ${inbox.inboxId}`);
    }
  }

  if (metadataFieldChanges?.length > 0) {
    for (const change of metadataFieldChanges) {
      const { fieldName, oldValue, newValue } = change;
      console.log(`Value ${fieldName} changed from ${oldValue} to ${newValue}`);
    }
  }
}
