import { HandlerContext, xmtpClient } from "@xmtp/message-kit";
import { db } from "../lib/db.js";
import { clearChatHistory } from "./agent.js";

await db.read();

const { v2client: bittu } = await xmtpClient({
  privateKey: process.env.KEY_BITTU,
  hideInitLogMessage: true,
});

export async function handlePoap(context: HandlerContext) {
  const {
    message: {
      content: { content: text, command, params },
      sender,
    },
  } = context;

  //const url = `https://mint.poap.studio/claim-20/`; will not render the frame
  //const url = `https://collectors.POAP.xyz/mint-v2/` will not render the frame (default poaps)
  const url = `https://converse.xyz/poap/`; // we use this to render the frame
  //const url = `https://dev.converse.xyz/poap/`; // we use this to render the frame
  //const url = `http://localhost:3000/poap/`; // we use this to render the frame
  if (command == "poap") {
    await db.read();
    // Destructure and validate parameters for the ens command
    const { address } = params;
    const poapTable = db?.data?.poaps;
    const poap = poapTable.find((poap) => poap.address == address);
    // Here we use address
    // Poap studio uses user_address
    // In converse web we transform address to user_address
    if (!poap) {
      const newPoap = poapTable.find((poap) => !poap.address);
      if (newPoap) {
        db?.data?.poaps?.push({ id: newPoap?.id, address: address });

        await db.write();
        clearChatHistory(sender.address);
        await context.send(`Here is your POAP`);
        await context.send(`${url}${newPoap?.id}?address=${address}`);
      } else {
        clearChatHistory(sender.address);
        await context.send(`No more POAPs available`);
      }
    } else if (poap) {
      clearChatHistory(sender.address);

      await context.send(`Here is the POAP you already claimed`);
      await context.send(`${url}${poap?.id}?address=${address}`);
    }
  } else if (command == "sendbittu") {
    const conversations = await bittu.conversations.list();

    let targetConversation = conversations.find(
      (conv) => conv.peerAddress.toLowerCase() === sender.address.toLowerCase()
    );

    if (!targetConversation) {
      targetConversation = await bittu.conversations.newConversation(
        sender.address.toLowerCase()
      );
    }
    await targetConversation.send(
      "psst, Bittu here. Do you want a exclusive POAP? Just ask me for it."
    );
    clearChatHistory(sender.address);
    return {
      code: 200,
      message: "Bittu sent",
    };
  } else if (command == "removepoap") {
    await db.read();
    const { address } = params;
    const poapTable = db?.data?.poaps;
    const claimed = poapTable.find(
      (poap) => poap?.address?.toLowerCase() === address?.toLowerCase()
    );
    if (claimed) {
      claimed.address = "";
      await db.write();
    } else {
      return {
        code: 400,
        message: "No POAP found for this address",
      };
    }
    return {
      code: 200,
      message: `Your poap ${claimed?.id} has been removed`,
    };
  }
}
