import { Context, Skill, V3Client } from "@xmtp/message-kit";
import { createGroup } from "../plugins/xmtp.js";
import express from "express";
import { checkNft } from "../plugins/alchemy.js";
import { addToGroup } from "../plugins/xmtp.js";
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
    client,
  } = context;

  if (skill === "create") {
    const group = await createGroup(
      client,
      sender.address,
      client.accountAddress,
    );

    await context.send(
      `Group created!\n- ID: ${group?.id}\n- Group Frame URL: https://converse.xyz/group/${group?.id}: \n- This url will deelink to the group inside Converse\n- Once in the other group you can share the invite with your friends.`,
    );
    return;
  } else {
    await context.send(
      "👋 Welcome to the Gated Bot Group!\nTo get started, type /create to set up a new group. 🚀\nThis example will check if the user has a particular nft and add them to the group if they do.\nOnce your group is created, you'll receive a unique Group ID and URL.\nShare the URL with friends to invite them to join your group!",
    );
  }
}

export function startGatedGroupServer(client: V3Client) {
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
        const added = await addToGroup(groupId, client, walletAddress);
        if (added.code === 200) {
          console.log(`Added wallet address: ${walletAddress} to the group`);
          return "success";
        } else {
          return added.message;
        }
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
