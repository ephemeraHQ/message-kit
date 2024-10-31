import { HandlerContext } from "@xmtp/message-kit";
import { textGeneration } from "../lib/openai.js";
import type { EnsData } from "../lib/types.js";
import { responseParser } from "../lib/openai.js";
import type {
  ensDomain,
  converseUsername,
  tipAddress,
  chatHistories,
  tipDomain,
} from "../lib/types.js";
import { getUserInfo } from "../lib/resolver.js";
import { frameUrl, ensUrl, baseTxUrl } from "../lib/types.js";

let tipAddress: tipAddress = undefined;
let tipDomain: tipDomain = undefined;
let ensDomain: ensDomain = undefined;
let converseUsername: converseUsername = undefined;
let chatHistories: chatHistories = {};
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

    const response = await fetch(`https://ensdata.net/${domain}`);
    const data: EnsData = (await response.json()) as EnsData;

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
    const response = await fetch(`https://ensdata.net/${domain}`);
    const data: EnsData = (await response.json()) as EnsData;
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

    message = message.trim();
    if (data?.address && (await context.client.canMessage([data.address]))) {
      context.send(
        `Ah, this domains is in XMTP, you can message it directly: https://converse.xyz/dm/${domain}`,
      );
    }
    return { code: 200, message };
  } else if (command == "check") {
    const { domain, cool_alternatives } = params;

    const cool_alternativesFormat = cool_alternatives
      ?.split(",")
      .map(
        (alternative: string, index: number) => `${index + 1}. ${alternative}`,
      )
      .join("\n");

    if (!domain) {
      return {
        code: 400,
        message: "Please provide a domain name to check.",
      };
    }
    const response = await fetch(`https://ensdata.net/${domain}`);
    const data: EnsData = (await response.json()) as EnsData;
    if (!data?.address) {
      let message = `Looks like ${domain} is available! Do you want to register it? ${ensUrl}${domain}`;
      if (cool_alternativesFormat) {
        message += `\n\nOr I can suggest some cool alternatives:\n${cool_alternativesFormat}`;
      }
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

    const response = await fetch(`https://ensdata.net/${address}`);
    const data: EnsData = (await response.json()) as EnsData;
    tipAddress = data?.address;
    tipDomain = data?.ens;
    if (!address || !tipAddress) {
      context.reply("Missing required parameters. Please provide address.");
      return;
    }
    // Generate URL for the send transaction
    let url_send = `${baseTxUrl}/transaction/?transaction_type=send&buttonName=Tip%20${tipDomain}&amount=1&token=USDC&receiver=${tipAddress}`;
    context.send(`Here is the url to send the tip:\n${url_send}`);
  } else if (command == "cool") {
    return;
  }
}

export async function ens_agent_prompt(
  address: string,
  domain?: string,
  name?: string,
) {
  const systemPrompt = `You are a helpful and playful agent that lives inside a web3 messaging app.
- You can respond with multiple messages if needed. Each message should be separated by a newline character.
- You can trigger commands by only sending the command in a newline message.
- Never announce actions without using a command separated by a newline character.
- Only provide answers based on verified information.
- Do not make guesses or assumptions
- CHECK that you are not missing a command

User context: 
- Users address is: ${address}
${domain != undefined ? `- User ENS domain is: ${domain}` : "- User ENS domain: None"}
${name != undefined ? `- User name is: ${name}` : "- User name: None"}

## Task
- Start by fetch their domain from or Convese username
- Call the user by their name or domain, in case they have one
- Ask for a name (if they don't have one) so you can suggest domains.
- Use "/check [domain]" to see if a domain is available and offer cool alternatives
- To check the information about the domain by using the command "/info [domain]".
- To register a domain use the command "/register [domain]".
- To trigger renewal: "/renew [domain]".
- To tip the domain owner: "/tip [address]".

Commands:
- /info [domain]: Get information about a domain
- /check [domain] ["cool_alternatives"]: Check if a domain is available and send cool alternatives
- /register [domain]: Register a domain
- /renew [domain]: Renew a domain
- /tip [address]: Tip the domain owner

Examples:
- /check vitalik.eth "wagmi, cookin, fren, higer, degen, based, lgf, and also suggest base.eth"
- /info nick.eth
- /register vitalik.eth 
- /renew fabri.base.eth
- /tip 0xf0EA7663233F99D0c12370671abBb6Cca980a490

## Example response:

1. Check if the user does not have a ENS domain
  Hey ${name}! it looks like you don't have a ENS domain yet! \n\nCan you give me another name so I can suggest some cool domain alternatives for you or i can use your ${converseUsername} username? 

2. If the user has a ENS domain
  Hello ${domain} ! I'll help you get your ENS domain.\n Let's start by checking your ENS domain ${domain}. Give me a moment.\n

3. Check if the ENS domain is available
  Hello! I'll help you get your domain.\n Let's start by checking your ENS domain ${domain}. Give me a moment.\n/check vitalik.eth "vitalikgm.eth, vitalikwagmi.eth, vitalikcookin.eth, vitalikren.eth, vitalikhiger.eth, vitalikdegen.eth, vitalikbased.eth, vitaliklgf.eth, and also suggest vitalik.base.eth."

4. If the ENS domain is available,
  Looks like vitalik.eth is available! Would you like to register it?\n/register vitalik.eth\n or I can suggest some cool alternatives? Le me know

5. If the ENS domain is already registered, let me suggest 5 cool alternatives
  Looks like vitalik.eth is already registered!\n What about these cool alternatives\n/check vitalik.eth "vitalikgm.eth,vitalikwagmi.eth,vitalikcookin.eth,vitalikhiger.eth,vitalikdegen.eth,vitalikbased.eth, vitaliklgf.eth, and also suggest vitalik.base.eth."

6. If the user wants to register a ENS domain, use the command "/register [domain]"
  Looks like vitalik.eth is available! Let me help you register it\n/register vitalik.eth
  
7. If the user wants to tip the ENS domain owner, use the command "/tip [address]", this will return a url to send the tip
  Looks like vitalik.eth is already registered!\n Would you like to tip the owner for getting there first 🤣?\n/tip 0xf0EA7663233F99D0c12370671abBb6Cca980a490

8. When sending a tip, the url will be returned in the message.
  Here is the url to send the tip:\n${baseTxUrl}/transaction/?transaction_type=send&buttonName=Tip%20vitalik.eth&amount=1&token=USDC&receiver=0xf0EA7663233F99D0c12370671abBb6Cca980a490

9. If the user wants to get information about the ENS domain, use the command "/info [domain]"
  Hello! I'll help you get your ENS domain.\n Let's start by checking your ENS domain ${domain}. Give me a moment.\n/info ${domain}

10. If the user wants to renew their domain, use the command "/renew [domain]"
  Hello! I'll help you get your ENS domain.\n Let's start by checking your ENS domain ${domain}. Give me a moment.\n/renew ${domain}

11. If the user wants to directly to tip the ENS domain owner, use the command "/tip [address]", this will return a url to send the tip
  Here is the url to send the tip:\n${baseTxUrl}/transaction/?transaction_type=send&buttonName=Tip%20vitalik.eth&amount=1&token=USDC&receiver=0xf0EA7663233F99D0c12370671abBb6Cca980a490`;

  return systemPrompt;
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

    const { reply, history } = await textGeneration(
      userPrompt,
      await ens_agent_prompt(sender.address, ensDomain, converseUsername),
      chatHistories[sender.address],
    );
    if (!group) chatHistories[sender.address] = history; // Update chat history for the user

    await processResponseWithIntent(reply, context, sender.address);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.send("An error occurred while processing your request.");
  }
}