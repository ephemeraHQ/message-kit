import { HandlerContext } from "@xmtp/message-kit";
import { generateCoolAlternatives } from "../lib/resolver.js";
import {
  getUserInfo,
  getInfoCache,
  clearInfoCache,
  isOnXMTP,
} from "../lib/resolver.js";
import { textGeneration } from "../lib/openai.js";
import { processResponseWithIntent } from "../lib/openai.js";
import { isAddress } from "viem";
import { ens_agent_prompt } from "../prompt.js";
import type {
  ensDomain,
  converseUsername,
  ChatHistories,
} from "../lib/types.js";
import { frameUrl, ensUrl, baseTxUrl, InfoCache } from "../lib/types.js";

let chatHistories: ChatHistories = {};
let ensDomain: ensDomain = {};
let converseUsername: converseUsername = {};

// URL for the send transaction
export async function handleEns(context: HandlerContext) {
  const {
    message: {
      content: { command, params, sender },
    },
  } = context;
  if (command == "reset") {
    clearChatHistory();
    return { code: 200, message: "Conversation reset." };
  } else if (command == "renew") {
    // Destructure and validate parameters for the ens command
    const { domain } = params;
    // Check if the user holds the domain
    if (!domain) {
      return {
        code: 400,
        message: "Missing required parameters. Please provide domain.",
      };
    }

    const data = await getInfoCache(domain);

    if (!data || data?.info.address !== sender?.address) {
      return {
        code: 403,
        message:
          "Looks like this domain is not registered to you. Only the owner can renew it.",
      };
    }

    // Generate URL for the ens
    let url_ens = frameUrl + "frames/manage?name=" + domain;
    return { code: 200, message: `${url_ens}` };
  } else if (command == "register") {
    // Destructure and validate parameters for the ens command
    const { domain } = params;

    if (!domain) {
      return {
        code: 400,
        message: "Missing required parameters. Please provide domain.",
      };
    }
    // Generate URL for the ens
    let url_ens = ensUrl + domain;
    return { code: 200, message: `${url_ens}` };
  } else if (command == "info") {
    const { domain } = params;

    const data = await getInfoCache(domain);
    if (!data) {
      return {
        code: 404,
        message: "Domain not found.",
      };
    }

    const formattedData = {
      Address: data?.info.address,
      "Avatar URL": data?.info.avatar_url,
      Description: data?.info.description,
      ENS: data?.info.ens,
      "Primary ENS": data?.info.ens_primary,
      GitHub: data?.info.github,
      Resolver: data?.info.resolverAddress,
      Twitter: data?.info.twitter,
      URL: `${ensUrl}${domain}`,
    };

    let message = "Domain information:\n\n";
    for (const [key, value] of Object.entries(formattedData)) {
      if (value) {
        message += `${key}: ${value}\n`;
      }
    }
    message += `\n\nWould you like to tip the domain owner for getting there first 🤣?`;
    message = message.trim();
    if (await isOnXMTP(context.v2client, data?.info.ens, data?.info.address)) {
      await context.send(
        `Ah, this domains is in XMTP, you can message it directly: https://converse.xyz/dm/${domain}`,
      );
    }
    return { code: 200, message };
  } else if (command == "check") {
    const { domain } = params;

    if (!domain) {
      return {
        code: 400,
        message: "Please provide a domain name to check.",
      };
    }

    const data = await getInfoCache(domain);
    if (!data?.info.address) {
      let message = `Looks like ${domain} is available! Do you want to register it? ${ensUrl}${domain} or would you like to see some cool alternatives?`;
      return {
        code: 200,
        message,
      };
    } else {
      let message = `Looks like ${domain} is already registered!`;
      await context.intent("/cool " + domain);
      return {
        code: 404,
        message,
      };
    }
  } else if (command == "tip") {
    const { address } = params;
    if (!address) {
      return {
        code: 400,
        message: "Please provide an address to tip.",
      };
    }
    const data = await getInfoCache(address);
    console.log(data?.info);
    let txUrl = `${baseTxUrl}/transaction/?transaction_type=send&buttonName=Tip%20${data?.info.ens ?? ""}&amount=1&token=USDC&receiver=${
      isAddress(address) ? address : data?.info.address
    }`;
    console.log(txUrl);
    return {
      code: 200,
      message: txUrl,
    };
  } else if (command == "cool") {
    const { domain } = params;
    //What about these cool alternatives?\
    return {
      code: 200,
      message: `${generateCoolAlternatives(domain)}`,
    };
  }
}

export async function clearChatHistory() {
  chatHistories = {};
  clearInfoCache();
  ensDomain = {};
  converseUsername = {};
}

export async function ensAgent(context: HandlerContext) {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.warn("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: {
      content: { content, params },
      sender,
    },
    group,
  } = context;

  try {
    let userPrompt = params?.prompt ?? content;
    const { converseUsername: newConverseUsername, ensDomain: newEnsDomain } =
      await getUserInfo(
        sender.address,
        ensDomain[sender.address],
        converseUsername[sender.address],
      );

    ensDomain[sender.address] = newEnsDomain;
    converseUsername[sender.address] = newConverseUsername;

    const { reply, history } = await textGeneration(
      userPrompt,
      await ens_agent_prompt(
        sender.address,
        ensDomain[sender.address],
        converseUsername[sender.address],
      ),
      chatHistories[sender.address],
    );
    if (!group) chatHistories[sender.address] = history; // Update chat history for the user

    chatHistories[sender.address] = await processResponseWithIntent(
      reply,
      context,
      chatHistories[sender.address],
    );
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.send("An error occurred while processing your request.");
  }
}
