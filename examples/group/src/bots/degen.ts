import { HandlerContext } from "@xmtp/botkit";
import {
  extractCommandValues,
  mapUsernamesToAddresses,
} from "../lib/helper.js";
import { users } from "../lib/users.js";
import { Client as xmtpClient } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";

export async function handler(context: HandlerContext) {
  const { senderAddress, content: mContent, contentType } = context.message;
  const { typeId } = contentType;
  let emoji: string = "",
    action: string = "",
    amount: number = 0,
    receiverAddresses: string[] = [],
    content: any = mContent,
    reference: string = "";

  if (typeId === "reply") {
    //Reply
    receiverAddresses = [content.receiver];
    content = content.content;
    reference = content.reference;
    if (content.includes("degen")) {
      const match = content.match(/(\d+)\s+(\w+)/);
      if (match) amount = parseInt(match[1]);
    }
  } else if (typeId === "text") {
    if (content.startsWith("/tip")) {
      const commandConfig = {
        tip: {
          params: {
            amount: [],
            username: [],
          },
        },
      };
      const extracted = extractCommandValues(content, commandConfig);
      const { amount: extractedAmount, username } = extracted.params;

      //@ts-ignore
      amount = parseInt(extractedAmount) || 10;
      //@ts-ignore
      receiverAddresses = mapUsernamesToAddresses(username, users);
    }
  } else if (typeId === "reaction") {
    //Reaction
    emoji = content.content;
    action = content.action;
    amount = 10;
    receiverAddresses = [content.receiver];
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
