import { isOnXMTP, V3Client, V2Client } from "@xmtp/message-kit";

export async function createGroup(
  client: V3Client,
  senderAddress: string,
  clientAddress: string,
) {
  try {
    let senderInboxId = "";
    await client.conversations.sync();
    const group = await client?.conversations.newGroup([
      senderAddress,
      clientAddress,
    ]);
    console.log("Group created", group?.id);
    const members = await group.members();
    const senderMember = members.find((member) =>
      member.accountAddresses.includes(senderAddress.toLowerCase()),
    );
    if (senderMember) {
      senderInboxId = senderMember.inboxId;
      console.log("Sender's inboxId:", senderInboxId);
    } else {
      console.log("Sender not found in members list");
    }
    await group.addSuperAdmin(senderInboxId);
    console.log(
      "Sender is superAdmin",
      await group.isSuperAdmin(senderInboxId),
    );
    await group.send(`Welcome to the new group!`);
    await group.send(`You are now the admin of this group as well as the bot`);
    return group;
  } catch (error) {
    console.log("Error creating group", error);
    return undefined;
  }
}

export async function removeFromGroup(
  groupId: string,
  client: V3Client,
  v2client: V2Client,
  senderAddress: string,
): Promise<{ code: number; message: string }> {
  try {
    let lowerAddress = senderAddress.toLowerCase();
    const { v2, v3 } = await isOnXMTP(client, v2client, lowerAddress);
    console.warn("Checking if on XMTP: v2", v2, "v3", v3);
    if (!v3)
      return {
        code: 400,
        message: "You don't seem to have a v3 identity ",
      };
    const conversation =
      await client.conversations.getConversationById(groupId);
    console.warn("removing from group", conversation?.id);
    await conversation?.sync();
    await conversation?.removeMembers([lowerAddress]);
    console.warn("Removed member from group");
    await conversation?.sync();
    const members = await conversation?.members();
    console.warn("Number of members", members?.length);

    let wasRemoved = true;
    if (members) {
      for (const member of members) {
        let lowerMemberAddress = member.accountAddresses[0].toLowerCase();
        if (lowerMemberAddress === lowerAddress) {
          wasRemoved = false;
          break;
        }
      }
    }
    return {
      code: wasRemoved ? 200 : 400,
      message: wasRemoved
        ? "You have been removed from the group"
        : "Failed to remove from group",
    };
  } catch (error) {
    console.log("Error removing from group", error);
    return {
      code: 400,
      message: "Failed to remove from group",
    };
  }
}
export async function addToGroup(
  groupId: string,
  client: V3Client,
  address: string,
  asAdmin: boolean = false,
): Promise<{ code: number; message: string }> {
  try {
    let lowerAddress = address.toLowerCase();
    const { v2, v3 } = await isOnXMTP(client, undefined, lowerAddress);
    if (!v3)
      return {
        code: 400,
        message: "You don't seem to have a v3 identity ",
      };
    const group = await client.conversations.getConversationById(groupId);
    console.warn("Adding to group", group?.id);
    await group?.sync();
    await group?.addMembers([lowerAddress]);
    console.warn("Added member to group");
    await group?.sync();
    if (asAdmin) {
      await group?.addSuperAdmin(lowerAddress);
    }
    const members = await group?.members();
    console.warn("Number of members", members?.length);

    if (members) {
      for (const member of members) {
        let lowerMemberAddress = member.accountAddresses[0].toLowerCase();
        if (lowerMemberAddress === lowerAddress) {
          console.warn("Member exists", lowerMemberAddress);
          return {
            code: 200,
            message: "You have been added to the group",
          };
        }
      }
    }
    return {
      code: 400,
      message: "Failed to add to group",
    };
  } catch (error) {
    return {
      code: 400,
      message: "Failed to add to group",
    };
  }
}
