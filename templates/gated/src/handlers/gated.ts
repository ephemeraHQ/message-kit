// Import necessary modules
import express from "express";
import { XMTPContext, V3Client,  Skill } from "@xmtp/message-kit";
import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API key
  network: Network.BASE_MAINNET, // Use the appropriate network
};

export let registerSkill: Skill[] = [
  {
    skill: "/create",
      examples: ["/create"],
      handler: handler,
      adminOnly: true,
      params: {},
      description: "Create a new group.",
    },
    {
      skill: "/id",
      examples: ["/id"],
      handler: handler,
      adminOnly: true,
      params: {},
      description: "Get group id.",
    },
  ],
};

async function handler(context: XMTPContext) {
  const {
    message: {
      sender,
      content: { skill },
    },
    client,
    group,
  } = context;

  if (skill == "id") {
    console.log(group?.id);
  } else if (skill === "create") {
    await context.send("Creating group...");
    const group = await createGroup(
      client,
      sender.address,
      client.accountAddress,
    );

    await context.send(
      `Group created!\n- ID: ${group.id}\n- Group Frame URL: https://converse.xyz/group/${group.id}: \n- This url will deelink to the group inside Converse\n- Once in the other group you can share the invite with your friends.`,
    );
    return;
  } else {
    await context.send(
      "👋 Welcome to the Gated Bot Group!\nTo get started, type /create to set up a new group. 🚀\nThis example will check if the user has a particular nft and add them to the group if they do.\nOnce your group is created, you'll receive a unique Group ID and URL.\nShare the URL with friends to invite them to join your group!",
    );
  }
}

export async function verifiedRequest(
  walletAddress: string,
  groupId: string,
): Promise<boolean> {
  console.log("new-request", {
    groupId,
    walletAddress,
  });

  const alchemy = new Alchemy(settings);
  try {
    const nfts = await alchemy.nft.getNftsForOwner(walletAddress);
    const collectionSlug = "XMTPeople"; // The slug for the collection

    const ownsNft = nfts.ownedNfts.some(
      (nft: any) =>
        nft.contract.name.toLowerCase() === collectionSlug.toLowerCase(),
    );
    console.log(
      `NFTs owned on ${Network.BASE_MAINNET}:`,
      nfts.ownedNfts.length,
    );
    console.log("is the nft owned: ", ownsNft);
    return ownsNft as boolean;
  } catch (error) {
    console.error("Error fetching NFTs from Alchemy:", error);
  }

  return false;
}

export function startServer(
  client: V3Client,
  verifiedRequest: (walletAddress: string, groupId: string) => Promise<boolean>,
) {
  async function addWalletToGroup(
    walletAddress: string,
    groupId: string,
  ): Promise<string> {
    const conversation =
      await client.conversations.getConversationById(groupId);
    const verified = await verifiedRequest(walletAddress, groupId);
    if (!verified) {
      console.log("User cant be added to the group");
      return "not verified";
    } else {
      try {
        await conversation?.addMembers([walletAddress]);
        console.log(`Added wallet address: ${walletAddress} to the group`);
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
  // Start the server
  const PORT = process.env.PORT || 3000;
  const url = process.env.URL || `http://localhost:${PORT}`;
  app.listen(PORT, () => {
    console.warn(
      `Use this endpoint to add a wallet to a group indicated by the groupId\n${url}/add-wallet <body: {walletAddress, groupId}>`,
    );
  });
}

export async function createGroup(
  client: V3Client,
  senderAddress: string,
  clientAddress: string,
) {
  let senderInboxId = "";
  const group = await client?.conversations.newGroup([
    senderAddress,
    clientAddress,
  ]);
  const members = await group.members();
  const senderMember = members.find((member) =>
    member.accountAddresses.includes(senderAddress.toLowerCase()),
  );
  if (senderMember) {
    const senderInboxId = senderMember.inboxId;
    console.log("Sender's inboxId:", senderInboxId);
  } else {
    console.log("Sender not found in members list");
  }
  await group.addSuperAdmin(senderInboxId);
  console.log("Sender is superAdmin", await group.isSuperAdmin(senderInboxId));
  await group.send(`Welcome to the new group!`);
  await group.send(`You are now the admin of this group as well as the bot`);
  return group;
}
