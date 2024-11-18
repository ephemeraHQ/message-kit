import { Client } from "@xmtp/node-sdk";
import { loadSkillsFile } from "../lib/skills.js";
import { Config } from "./types";

export const shorterLogMessage = (message: string) => {
  return message?.substring(0, 60) + (message?.length > 60 ? "..." : "");
};

export const logMessage = (message: string) => {
  if (process.env.MSG_LOG === "false") return;
  console.log(shorterLogMessage(message));
};

export async function logInitMessage(
  client: Client,
  config?: Config,
  generatedKey?: string,
) {
  if (config?.hideInitLogMessage === true) return;

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
  console.log(`
    Send a message to this account on Converse:                              
    🔗 https://converse.xyz/dm/${client.accountAddress}`);

  const skills = config?.skills ?? (await loadSkillsFile());

  if (
    config?.experimental ||
    config?.attachments ||
    config?.memberChange ||
    config?.client?.structuredLogging ||
    generatedKey ||
    skills?.length === 0 ||
    skills === undefined ||
    config?.skills === undefined
  ) {
    console.warn(`\x1b[33m
    Warnings:`);
    if (config?.attachments) {
      console.warn("\t- ⚠️ Attachments are enabled");
    }
    if (generatedKey) {
      console.warn(
        `\t- ⚠️🔒 Invalid private key or not set. Generating a random one in your .env file.`,
      );
    }
    if (config?.client?.structuredLogging) {
      console.warn(
        `\t- ⚠️ Structured logging is set to ${config.client.structuredLogging}`,
      );
    }
    if (config?.privateKey) {
      console.warn("\t- ⚠️ Private key is set from the code");
    }
    if (config?.memberChange) {
      console.warn("\t- ⚠️ Member changes are enabled");
    }
    if (skills === undefined || config?.skills === undefined) {
      console.warn("\t- ⚠️ No skills.ts file found or wrongly formatted");
    }
    if (config?.experimental) {
      console.warn(
        `\t- ☣️ EXPERIMENTAL MODE ENABLED:\n\t\t⚠️ All group messages will be exposed — proceed with caution.\n\t\tℹ Guidelines: https://messagekit.ephemerahq.com/concepts/guidelines`,
      );
    }
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Logging new messages to console ↴`);
}
