import { Client } from "@xmtp/node-sdk";
import { Config } from "./types";
import { loadSkillsFile } from "../lib/skills.js";

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
    generatedKey ||
    skills?.length === 0
  ) {
    console.warn(`\x1b[33m
    Warnings:`);
    if (config?.attachments) {
      console.warn("\t- ⚠️ Attachments are enabled");
    }
    if (generatedKey) {
      console.warn(
        `\t- ⚠️🔒 Invalid private key or not set. Generating a random one.\n\t\t- Copy and paste it in your .env file as:\n\t\t- KEY=${generatedKey}`,
      );
    }
    if (config?.client?.logging) {
      console.warn(`\t- ⚠️ Logging is set to ${config.client.logging}`);
    }
    if (config?.privateKey) {
      console.warn("\t- ⚠️ Private key is set from the code");
    }
    if (config?.memberChange) {
      console.warn("\t- ⚠️ Member changes are enabled");
    }
    if (config?.skills) {
      console.warn(`\t- ⚠️ Skills are missing`);
    }
    if (skills === undefined || skills?.length === 0) {
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
