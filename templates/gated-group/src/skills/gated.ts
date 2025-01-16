import { Context, Skill } from "@xmtp/message-kit";
import express from "express";
import { Client } from "@xmtp/node-sdk";
import { checkNft } from "../plugins/alchemy.js";

export const gated: Skill[] = [
  {
    skill: "create",
    examples: ["/create"],
    handler: handler,
    adminOnly: true,
    description: "Create a new group.",
  },
];

async function handler(context: Context) {
  const {
    message: {
      sender,
      content: { skill },
    },
    xmtp,
  } = context;

  if (skill === "create") {
    const group = await createGroup(xmtp.client, sender.address, xmtp.address);

    await context.send({
      message: `Group created!\n- ID: ${group?.id}\n- Group Frame URL: https://converse.xyz/group/${group?.id}: \n- This url will deelink to the group inside Converse\n- Once in the other group you can share the invite with your friends.`,
      originalMessage: context.message,
    });
    return;
  } else {
    await context.send({
      message:
        "👋 Welcome to the Gated Bot Group!\nTo get started, type /create to set up a new group. 🚀\nThis example will check if the user has a particular nft and add them to the group if they do.\nOnce your group is created, you'll receive a unique Group ID and URL.\nShare the URL with friends to invite them to join your group!",
      originalMessage: context.message,
    });
  }
}

export function startGatedGroupServer(client: Client) {
  async function addWalletToGroup(
    walletAddress: string,
    groupId: string,
  ): Promise<string> {
    const verified = await checkNft(walletAddress, "XMTPeople");
    if (!verified) {
      console.log("User cant be added to the group");
      return "not verified";
    } else {
      try {
        await addToGroup(groupId, client, walletAddress);
        return "success";
      } catch (error: any) {
        console.log(error.message);
        return "error";
      }
    }
  }

  // Endpoint to add wallet address to a group from an external source
  const app = express();
  app.use(express.json());
  app.post("/add-wallet", async (req, res) => {
    try {
      const { walletAddress, groupId } = req.body;
      const result = await addWalletToGroup(walletAddress, groupId);
      res.status(200).send(result);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });
  // Start the servfalcheer
  const PORT = process.env.PORT || 3000;
  const url = process.env.URL || `http://localhost:${PORT}`;
  app.listen(PORT, () => {
    console.warn(
      `Use this endpoint to add a wallet to a group indicated by the groupId\n${url}/add-wallet <body: {walletAddress, groupId}>`,
    );
  });
}

export async function createGroup(
  client: Client | undefined,
  senderAddress: string | undefined,
  clientAddress: string | undefined,
) {
  try {
    let senderInboxId = "";
    await client?.conversations.sync();
    const group = await client?.conversations.newGroup([
      senderAddress ?? "",
      clientAddress ?? "",
    ]);
    console.log("Group created", group?.id);
    const members = await group?.members();
    const senderMember = members?.find((member) =>
      member.accountAddresses.includes(senderAddress?.toLowerCase() ?? ""),
    );
    if (senderMember) {
      senderInboxId = senderMember.inboxId;
      console.log("Sender's inboxId:", senderInboxId);
    } else {
      console.log("Sender not found in members list");
    }
    await group?.addSuperAdmin(senderInboxId);
    console.log(
      "Sender is superAdmin",
      await group?.isSuperAdmin(senderInboxId),
    );
    await group?.send(`Welcome to the new group!`);
    await group?.send(`You are now the admin of this group as well as the bot`);
    return group;
  } catch (error) {
    console.log("Error creating group", error);
    return undefined;
  }
}

export async function removeFromGroup(
  groupId: string,
  client: Client,
  senderAddress: string,
): Promise<{ code: number; message: string }> {
  try {
    let lowerAddress = senderAddress.toLowerCase();
    const isOnXMTP = await client.canMessage([lowerAddress]);
    if (!isOnXMTP)
      return {
        code: 400,
        message: "You don't seem to have a XMTP identity ",
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
  client: Client,
  address: string,
  asAdmin: boolean = false,
): Promise<{ code: number; message: string }> {
  try {
    let lowerAddress = address.toLowerCase();
    const isOnXMTP = await client.canMessage([lowerAddress]);
    if (!isOnXMTP)
      return {
        code: 400,
        message: "You don't seem to have a XMTP identity ",
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
