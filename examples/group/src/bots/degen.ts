import { HandlerContext } from "@xmtp/botkit";
import { mapUsernamesToAddresses } from "@xmtp/botkit";
import { users } from "../lib/users.js";
import { Client as xmtpClient } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";

export async function handler(context: HandlerContext) {
  const { senderAddress, content, typeId } = context.message;
  const { params } = content;
  let amount: number = 0,
    receiverAddresses: string[] = [],
    reference: string = "";

  if (typeId === "reply") {
    const { content: reply, receiver } = content;
    //Reply
    console.log("reply", reply); //reply 10 $degen
    receiverAddresses = [receiver];
    if (reply.includes("$degen")) {
      const match = reply.match(/(\d+)/);
      if (match) amount = parseInt(match[0]);
    }
  } else if (typeId === "text") {
    const { content: text } = content;
    if (text.startsWith("/tip")) {
      const { amount: extractedAmount, username } = params;

      //@ts-ignore
      amount = parseInt(extractedAmount) || 10;
      //@ts-ignore
      receiverAddresses = mapUsernamesToAddresses(username, users);
    }
  } else if (typeId === "reaction") {
    const { content: reaction, action, receiver } = content;
    //Reaction
    if (reaction === "degen" && action === "added") {
      amount = 10;
      receiverAddresses = [receiver];
    }
  }
  const sender = users.find((user) => user.address === senderAddress);
  const receivers = users.filter((user) =>
    receiverAddresses.includes(user.address),
  );

  //console.log("content", sender, receivers, amount);

  if (!sender || receivers.length === 0 || amount === 0) {
    context.reply("Sender or receiver or amount not found.");
    return;
  }
  if (sender.degen >= amount * receivers.length) {
    sender.degen -= amount * receivers.length;
    receivers.forEach(async (receiver) => {
      receiver.degen += amount;
      context.reply(
        `You received ${amount} DEGEN tokens from ${sender.username}. Your new balance is ${receiver.degen} DEGEN tokens.`,
        [receiver.address],
      );
      //notifyUser(receiver, amount, sender);
    });
    context.reply(
      `You sent ${
        amount * receivers.length
      } DEGEN tokens in total. Your remaining balance: ${
        sender.degen
      } DEGEN tokens.`,
      [sender.address],
      reference,
    );
  } else {
    context.reply("Insufficient DEGEN tokens to send.");
  }
}
const notifyUser = async (receiver: any, amount: number, sender: any) => {
  if (sender.username === "bot") return;
  const key =
    "0x1807fa41217bee883da6d4daea305b3157d1787bea40fd26040b031f4d65b38e";
  const wallet = new Wallet(key);
  const client = await xmtpClient.create(wallet, { env: "production" });
  const conv = await client.conversations.newConversation(sender.address);
  conv.send(
    `You received ${amount} DEGEN tokens from ${sender.username}. Your new balance is ${receiver.degen} DEGEN tokens.`,
  );
};
