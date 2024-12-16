import dotenv from "dotenv";
dotenv.config({ override: true });
import { Client } from "@xmtp/node-sdk";
import { AgentConfig } from "../helpers/types";
import { Agent } from "../helpers/types";
// Add these at the top level of the file
const userInteractions = new Map<string, number>();
let totalInteractions = 0;

export async function logUserInteraction(address: string) {
  if (process.env.NODE_ENV !== "production") return;
  if (!address) return;
  let userAddress = address.toLowerCase();
  if (userAddress) {
    const isNewUser = !userInteractions.has(userAddress);
    const currentCount = userInteractions.get(userAddress) || 0;

    userInteractions.set(userAddress, currentCount + 1);
    totalInteractions++;

    if (isNewUser) {
      console.log(
        `New user ${userAddress}! Now ${userInteractions.size} users have interacted ${totalInteractions} times`,
      );
    }
  }
}

const { fsPromises } = getFS();
export const logMessage = (message: any) => {
  if (process?.env?.MSG_LOG === "true") console.log(message);
};
export async function checkStorage() {
  try {
    console.log("Railway directory:", process.env.RAILWAY_VOLUME_MOUNT_PATH);
    // try {
    //   const filesRoot = await fsPromises?.readdir("/");
    //   console.log("Storage directory:", "/");
    //   console.log("All files:", filesRoot);
    // } catch (error) {
    //   console.error("Error checking storage:", error);
    // }
    // try {
    //   const filesRoot2 = await fsPromises?.readdir("/app/");
    //   console.log("Storage directory:", "/app/");
    //   console.log("All files:", filesRoot2);
    // } catch (error) {
    //   console.error("Error checking storage:", error);
    // }
    try {
      const filesRoot3 = await fsPromises?.readdir("/app/data/.data");
      console.log("Storage directory:", "/app/data/.data");
      console.log("All files:", filesRoot3);
    } catch (error) {
      console.error("Error checking storage:", error);
    }
  } catch (error) {
    console.error("Error checking storage:", error);
  }
}
export async function logInitMessage(
  client: Client,
  agentConfig?: AgentConfig,
  generatedKey?: string,
  agent?: Agent,
) {
  await checkStorage();
  if (agentConfig?.hideInitLogMessage === true) return;

  const coolLogo = `\x1b[38;2;250;105;119m\
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ███╗   ███╗███████╗███████╗███████╗ █████╗  ██████╗ ███████╗██╗  ██╗██╗████████╗
  ████╗ ████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝ ██╔════╝██║ ██╔╝██║╚══██╔══╝
  ██╔████╔██║█████╗  ███████╗███████╗███████║██║  ███╗█████╗  █████╔╝ ██║   ██║   
  ██║╚██╔╝██║██╔══╝  ╚════██║╚════██║██╔══██║██║   ██║██╔══╝  ██╔═██╗ ██║   ██║   
  ██║ ╚═╝ ██║███████╗███████║███████║██║  ██║╚██████╔╝███████╗██║  ██╗██║   ██║   
  ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   
  Powered by XMTP \x1b[0m`;
  console.log(coolLogo);
  console.log(`\nSend a message to this account on:                              
      \x1b[90m Converse: https://converse.xyz/dm/${client.accountAddress}\x1b[0m
      \x1b[38;2;0;0;255m Coinbase Wallet: https://go.cb-w.com/messaging?address=${client.accountAddress}\x1b[0m
      \x1b[38;2;128;0;128m Share in Farcaster (Framev2): https://frames.message-kit.org/dm/${client.accountAddress}\x1b[0m`);

  if (
    agentConfig?.walletService == true ||
    agentConfig?.attachments ||
    process.env.OPENAI_API_KEY === undefined ||
    agentConfig?.client?.structuredLogging ||
    agentConfig?.privateKey ||
    agentConfig?.memberChange ||
    agent === undefined ||
    agent?.skills?.flat().length === 0 ||
    generatedKey
  ) {
    console.warn(`\x1b[33m\n\tWarnings:`);
    if (agentConfig?.attachments) {
      console.warn("\t- ⚠️ Attachments are enabled");
    }

    if (generatedKey) {
      console.warn(
        `\t- ⚠️ Invalid private key or not set. Generating a random one in your .env file.`,
      );
    }
    if (process.env.OPENAI_API_KEY === undefined) {
      console.warn(
        `\t- ⚠️ OPENAI_API_KEY is not set. Please set it in your .env file.`,
      );
    }
    if (agentConfig?.client?.structuredLogging) {
      console.warn(
        `\t- ⚠️ Structured logging is set to ${agentConfig.client.structuredLogging}`,
      );
    }
    if (agentConfig?.privateKey) {
      console.warn("\t- ⚠️ Private key is set from the code");
    }
    if (agentConfig?.memberChange) {
      console.warn("\t- ⚠️ Member changes are enabled");
    }
    if (agent === undefined || agent?.skills?.flat().length === 0) {
      console.warn("\t- ⚠️ No skills found");
    }
    if (agentConfig?.experimental) {
      console.warn(
        `\t- ☣️ EXPERIMENTAL MODE ENABLED:\n\t\t⚠️ All group messages will be exposed — proceed with caution.\n\t\tℹ Guidelines: https://message-kit.org/guidelines`,
      );
    }
    if (agentConfig?.walletService === true) {
      if (
        process.env.COINBASE_API_KEY_NAME &&
        process.env.COINBASE_API_KEY_PRIVATE_KEY
      ) {
        console.warn("\t- ⚠️ CDP Wallet Service is enabled");

        console.warn(
          `\t\t- Save wallets at your discretion.\n\t\t- An agent wallet will be available for every user.\n\t\t- Developers are responsible for their own wallets.`,
        );
      } else if (process.env.CIRCLE_API_KEY) {
        console.warn("\t- ⚠️ Circle Wallet Service is enabled");

        console.warn(
          `\t\t- Save wallets at your discretion.\n\t\t- An agent wallet will be available for every user.\n\t\t- Developers are responsible for their own wallets.`,
        );
      } else {
        console.warn("\t- ⚠️ Wallet Service is enabled but missing API keys");
      }
    }
    console.warn("\x1b[0m"); // Reset color to default
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Logging new messages to console ↴`);
}

import { promises as fsPromisesModule } from "fs";
import * as fsSync from "fs";

export function getFS() {
  const fs = typeof window === "undefined" ? fsSync : undefined;
  const fsPromises =
    typeof window === "undefined" ? fsPromisesModule : undefined;
  return { fs, fsPromises };
}

export async function getCacheCreationDate() {
  const { fsPromises } = getFS();
  if (!fsPromises) return undefined;
  try {
    const stats = await fsPromises.stat(".data");
    return new Date(stats.birthtime);
  } catch (err) {
    console.error("Error getting cache creation date:", err);
    return undefined;
  }
}

export async function readFile(filePath: string) {
  const { fs } = getFS();
  if (!fs) return undefined;
  try {
    return await fs.readFileSync(filePath);
  } catch (err) {
    console.error("Error reading file:", err);
    return undefined;
  }
}
