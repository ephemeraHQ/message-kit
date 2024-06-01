import { HandlerContext } from "@xmtp/botkit";
import { Wallet } from "ethers";
import { Client as xmtpClient } from "@xmtp/xmtp-js";
import { extractCommandValues } from "../lib/helper.js";
import { users } from "../lib/users.js";

const commandConfig = {
  bet: {
    params: {
      username: [],
      name: [],
      amount: [],
    },
  },
};

export async function handler(context: HandlerContext) {
  const { content, senderAddress } = context.message;

  const extractedValues = extractCommandValues(content, commandConfig);
  let url = "";
  switch (extractedValues.command) {
    case "bet":
      const { amount, name, username } = extractedValues.params;
      if (!amount || !name || !username) {
        context.reply(
          "Missing required parameters. Please provide amount, token, and username.",
        );
        return;
      }

      // Ensure that amount, name, and username are treated as single strings
      const singleName = Array.isArray(name) ? name[0] : name;
      const singleAmount = Array.isArray(amount) ? amount[0] : amount;

      /* This is for creating a group
      
      const recipientUser = users.find(
        //@ts-ignore
        (user) => user.username === username[0]?.replace("@", ""),
      );
      if (!recipientUser || !recipientUser.address) {
        context.reply("User not found or user address is missing.");
        return;
      }
      */
      url = await generateBetUrl(
        context.message.senderAddress,
        singleName,
        singleAmount,
      );
      context.reply(`Bet created!. Go here: ${url}`, []);
      break;
    default:
      context.reply(
        "Unknown command. Use /help to see all available commands.",
      );
  }
}

async function generateBetUrl(
  senderAddress: string,
  betName: string,
  amount: string,
) {
  const baseUrl = "dm:/";
  const key =
    "0xf999aa0e24be24df5700e76f8d146c049e99ad6480918ee6cbdd73fec3336a98";
  const wallet = new Wallet(key);
  const client = await xmtpClient.create(wallet, { env: "production" });
  const conv = await client.conversations.newConversation(senderAddress);
  await conv.send(`Bet created!\n${betName} for $${amount}`);
  await conv.send(
    `https://base-frame-lyart.vercel.app/transaction?transaction_type=send&amount=1&token=eth&receiver=0xA45020BdA714c3F43fECDC6e38F873fFF2Dec8ec`,
  );
  await conv.send(
    `Place your bet tx:0xf0490b45884803924Ca84C2051ef435991D7350D`,
  );
  const link = `${baseUrl}${client.address}`;
  return link;
}
