import { HandlerContext } from "@xmtp/message-kit";
import { Client } from "@xmtp/xmtp-js";
import {
  getUserInfo,
  getInfoCache,
  InfoCache,
  isOnXMTP,
} from "../lib/resolver.js";
import { textGeneration, responseParser } from "../lib/openai.js";
import { ens_agent_prompt } from "../prompt.js";
import type {
  ensDomain,
  converseUsername,
  tipAddress,
  chatHistories,
  tipDomain,
} from "../lib/types.js";
import { frameUrl, ensUrl, baseTxUrl } from "../lib/types.js";

let tipAddress: tipAddress = undefined;
let tipDomain: tipDomain = undefined;
let ensDomain: ensDomain = undefined;
let converseUsername: converseUsername = undefined;
let chatHistories: chatHistories = {};
let infoCache: InfoCache = {};

// URL for the send transaction
export async function handleEns(context: HandlerContext) {
  const {
    message: {
      content: { command, params, sender },
    },
  } = context;

  if (command == "renew") {
    // Destructure and validate parameters for the ens command
    const { domain } = params;
    // Check if the user holds the domain
    if (!domain) {
      context.reply("Missing required parameters. Please provide domain.");
      return;
    }

    const { infoCache: retrievedInfoCache } = await getInfoCache(
      domain,
      infoCache,
    );
    infoCache = retrievedInfoCache;
    let data = infoCache[domain].info;

    if (data?.address !== sender?.address) {
      return {
        code: 403,
        message: "You do not hold this domain. Only the owner can renew it.",
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

    const { infoCache: retrievedInfoCache } = await getInfoCache(
      domain,
      infoCache,
    );
    infoCache = retrievedInfoCache;
    let data = infoCache[domain].info;

    const formattedData = {
      Address: data?.address,
      "Avatar URL": data?.avatar_url,
      Description: data?.description,
      ENS: data?.ens,
      "Primary ENS": data?.ens_primary,
      GitHub: data?.github,
      Resolver: data?.resolverAddress,
      Twitter: data?.twitter,
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
    if (await isOnXMTP(context.v2client as Client, data?.ens, data?.address)) {
      context.send(
        `Ah, this domains is in XMTP, you can message it directly: https://converse.xyz/dm/${domain}`,
      );
    }
    return { code: 200, message };
  } else if (command == "check") {
    console.log(params);
    const { domain, cool_alternatives } = params;

    const cool_alternativesFormat = cool_alternatives
      ?.split(",")
      .map(
        (alternative: string, index: number) =>
          `${index + 1}. ${alternative} ✨`,
      )
      .join("\n");

    if (!domain) {
      return {
        code: 400,
        message: "Please provide a domain name to check.",
      };
    }
    const { infoCache: retrievedInfoCache } = await getInfoCache(
      domain,
      infoCache,
    );
    infoCache = retrievedInfoCache;
    let data = infoCache?.[domain]?.info;
    if (!data?.address) {
      let message = `Looks like ${domain} is available! Do you want to register it? ${ensUrl}${domain}`;
      return {
        code: 200,
        message,
      };
    } else {
      let message = `Looks like ${domain} is already registered! What about these cool alternatives?\n\n${cool_alternativesFormat}`;
      return {
        code: 404,
        message,
      };
    }
  } else if (command == "tip") {
    // Destructure and validate parameters for the send command
    const { address } = params;

    const { infoCache: retrievedInfoCache } = await getInfoCache(
      address,
      infoCache,
    );
    infoCache = retrievedInfoCache;
    let data = infoCache[address].info;

    tipAddress = data?.address;
    tipDomain = data?.ens;

    if (!address || !tipAddress) {
      context.reply("Missing required parameters. Please provide address.");
      return;
    }
    let txUrl = `${baseTxUrl}/transaction/?transaction_type=send&buttonName=Tip%20${tipDomain}&amount=1&token=USDC&receiver=${tipAddress}`;
    // Generate URL for the send transaction
    context.send(`Here is the url to send the tip:\n${txUrl}`);
  } else if (command == "cool") {
    return;
  }
}

export async function clearChatHistory() {
  chatHistories = {};
}

async function processResponseWithIntent(
  reply: string,
  context: any,
  senderAddress: string,
) {
  let messages = reply
    .split("\n")
    .map((message: string) => responseParser(message))
    .filter((message): message is string => message.length > 0);

  console.log(messages);
  for (const message of messages) {
    if (message.startsWith("/")) {
      const response = await context.intent(message);
      if (response && response.message) {
        let msg = responseParser(response.message);

        chatHistories[senderAddress]?.push({
          role: "system",
          content: msg,
        });

        await context.send(response.message);
      }
    } else {
      await context.send(message);
    }
  }
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
      await getUserInfo(sender.address, ensDomain, converseUsername);

    ensDomain = newEnsDomain;
    converseUsername = newConverseUsername;
    let txUrl = `${baseTxUrl}/transaction/?transaction_type=send&buttonName=Tip%20${tipDomain}&amount=1&token=USDC&receiver=${tipAddress}`;

    const { reply, history } = await textGeneration(
      userPrompt,
      await ens_agent_prompt(
        sender.address,
        ensDomain,
        converseUsername,
        tipAddress,
        txUrl,
      ),
      chatHistories[sender.address],
    );
    if (!group) chatHistories[sender.address] = history; // Update chat history for the user

    await processResponseWithIntent(reply, context, sender.address);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.send("An error occurred while processing your request.");
  }
}
