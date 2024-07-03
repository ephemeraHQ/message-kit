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
          added.inboxId.toLowerCase() === member?.inboxId?.toLowerCase(),
      ),
    )
    .map((member: User) => `@${member.username}`)
    .filter((name: string) => name.trim() !== "@") // Filter out empty or undefined usernames
    .join(", "); // Join names for message formatting

  if (addedNames && addedNames.trim().length > 0) {
    let messages = [
      `Welcome, ${addedNames}! 🎉 @${adminName} created a new token for you!`,
      `Hey ${addedNames}! 👋 @${adminName} says you’re going to the moon with us!`,
      `Welcome, ${addedNames}! 🛳️ @${adminName} added you to the whitelist!`,
      `${addedNames}, welcome to the group! 😎 @${adminName} says it's fully decentralized!`,
      `${addedNames}, you've joined the chat! 🚀 @${adminName} saved your place in the group!`,
      `Hey ${addedNames}, welcome! 🎉 @${adminName} saved some gas fees for you!`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  return "";
}
function handleRemoveMembers(adminName: string) {
  let messages = [
    `🪦`,
    `☠️☠️☠️`,
    `💀`,
    `👻`,
    `hasta la vista, baby`,
    `nuked ☠️💣, by @${adminName}`,
  ];
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
    `The group name was just renamed to '${newValue}'! 📝 Now @${adminName} is scrambling to update the smart contracts!`,
    `The group name has changed to '${newValue}'! 🎉 @${adminName} is now rewriting the blockchain in panic!`,
    `A new group name has been decided to '${newValue}'! 🔄 @${adminName} is checking if it's hashable!`,
    `Look out! The group name is now '${newValue}'! 🕵️‍♂️ @${adminName} is on a secret mission to encode it!`,
    `It's official, '${newValue}' is the new group name! 🚀 @${adminName} is already launching it into the crypto space!`,
    `Say hello to our new group name, '${newValue}'! 🎭 @${adminName} is preparing the disguise kits!`,
    `We've updated our group name to '${newValue}'! 🧙‍♂️ Watch as @${adminName} casts a renaming spell!`,
    `New group name alert: '${newValue}'! 🚨 @${adminName} is setting up the alarm systems!`,
    `Welcome to the newly named '${newValue}'! 🌐 @${adminName} is spinning the globe for this one!`,
    `The group has a fresh start as '${newValue}'! 🌱 @${adminName} is planting the seeds for growth!`,
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
          const userArrays = username.map((user: User) => user.address);
          await conversation.sync();
          await conversation.removeMembers(userArrays);
          const messages = handleRemoveMembers(sender.username);
          context.reply(messages);
        } catch (error) {
          context.reply("User doesnt exist or lacks admin privileges");
          console.error(error);
        }
        break;
      case "add":
        try {
          const addedInboxes = username.map((user: User) =>
            user.inboxId.toLowerCase(),
          );
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
          context.reply("User already exists or lacks admin privileges");
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
  if (process.env.MSG_LOG === "true") {
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
