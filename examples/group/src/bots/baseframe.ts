import { run, HandlerContext } from "@xmtp/botkit";
import { extractCommandValues, generateFrameURL } from "../lib/helper.js";
import { users } from "../lib/users.js";

const baseUrl = "https://base-frame-lyart.vercel.app/transaction";
const commandConfig = {
  send: {
    params: {
      amount: [],
      token: ["eth", "dai", "usdc", "degen"],
      username: [],
    },
  },
  swap: {
    params: {
      amount: [],
      token_from: ["eth", "dai", "usdc", "degen"],
      token_to: ["eth", "dai", "usdc", "degen"],
    },
  },
  mint: {
    params: {
      address: [],
      amount: [],
    },
  },
  help: {
    params: {},
  },
  show: {
    params: {},
  },
};

export function handler(context: HandlerContext) {
  const { content, senderAddress } = context.message;

  const extractedValues = extractCommandValues(content, commandConfig);

  let url = "";
  switch (extractedValues.command) {
    case "send":
    case "tip":
    case "donate":
    case "buy":
      const {
        amount: amountSend,
        token: tokenSend,
        username,
      } = extractedValues.params;
      if (!amountSend || !tokenSend || !username) {
        context.reply(
          "Missing required parameters. Please provide amount, token, and username.",
        );
        return;
      }

      const recipientUser = users.find(
        //@ts-ignore
        (user) => user.username === username[0]?.replace("@", ""),
      );
      url = generateFrameURL(baseUrl, "send", {
        amount: amountSend,
        token: tokenSend,
        receiver: recipientUser?.address,
      });
      context.reply(`${url}`);
      break;
    case "swap":
      const { amount, token_from, token_to } = extractedValues.params;
      if (!amount || !token_from || !token_to) {
        context.reply(
          "Missing required parameters. Please provide amount, token_from, and token_to.",
        );
        return;
      }
      url = generateFrameURL(baseUrl, "swap", {
        amount,
        token_from,
        token_to,
      });
      context.reply(`${url}`);
      break;
    case "mint":
      const { address: collectionAddress, numeric: tokenId } =
        extractedValues.params;
      let collection =
        collectionAddress || "0x73a333cb82862d4f66f0154229755b184fb4f5b0";
      let token = tokenId || 1;
      if (!collection || !token) {
        context.reply(
          "Missing required parameters. Please provide collection address and token id.",
        );
        return;
      }
      url = generateFrameURL(baseUrl, "mint", {
        collection:
          collectionAddress || "0x73a333cb82862d4f66f0154229755b184fb4f5b0",
        token_id: tokenId || 1, // Default token ID if not specified
      });
      context.reply(url);
      break;
    case "help":
      context.reply(
        "Available commands:\n" +
          "/baseframe send [amount] [token] [username] - Send a specified amount of a cryptocurrency to a destination address.\n" +
          "/baseframe swap [amount] [token_from] [token_to] - Exchange one type of cryptocurrency for another.\n" +
          "/baseframe mint [collection_address] [token_id] - Create (mint) a new token or NFT.\n" +
          "/baseframe help - Display this help message.",
      );
      break;
    case "show":
      context.reply(`${baseUrl.replace("/transaction", "")}`);
      break;
    default:
      context.reply(
        "Unknown command. Use /help to see all available commands.",
      );
  }
}
