import dotenv from "dotenv";
dotenv.config({ override: true });
import { Client } from "@xmtp/node-sdk";
import { RunConfig } from "./types";
import { loadSkillsFile } from "../lib/skills";
import pino from "pino";
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true, // Colorize output for better readability
      translateTime: "SYS:standard", // Add timestamp to logs
      ignore: "pid,hostname", // Ignore certain fields
    },
  }, // Use default JSON format in production
});
export const logMessage = (message: any) => {
  //let msh = message?.substring(0, 60) + (message?.length > 60 ? "..." : "");
  if (process?.env?.MSG_LOG === "true") logger.info(message);
};

export async function logInitMessage(
  client: Client,
  runConfig?: RunConfig,
  generatedKey?: string,
) {
  if (runConfig?.hideInitLogMessage === true) return;

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

  let skills = runConfig?.skills ?? (await loadSkillsFile());

  if (
    runConfig?.experimental ||
    process?.env?.OPEN_AI_API_KEY === undefined ||
    runConfig?.attachments ||
    runConfig?.memberChange ||
    runConfig?.client?.structuredLogging ||
    skills === undefined ||
    skills.length === 0 ||
    generatedKey
  ) {
    console.warn(`\x1b[33m\n\tWarnings:`);
    if (runConfig?.attachments) {
      console.warn("\t- ⚠️ Attachments are enabled");
    }
    if (generatedKey) {
      console.warn(
        `\t- ⚠️🔒 Invalid private key or not set. Generating a random one in your .env file.`,
      );
    }
    if (process.env.OPEN_AI_API_KEY === undefined) {
      console.warn(
        `\t- ⚠️ OPEN_AI_API_KEY is not set. Please set it in your .env file.`,
      );
    }
    if (runConfig?.client?.structuredLogging) {
      console.warn(
        `\t- ⚠️ Structured logging is set to ${runConfig.client.structuredLogging}`,
      );
    }
    if (runConfig?.privateKey) {
      console.warn("\t- ⚠️ Private key is set from the code");
    }
    if (runConfig?.memberChange) {
      console.warn("\t- ⚠️ Member changes are enabled");
    }
    if (skills === undefined || skills.length === 0) {
      console.warn("\t- ⚠️ No skills found");
    }
    if (runConfig?.experimental) {
      console.warn(
        `\t- ☣️ EXPERIMENTAL MODE ENABLED:\n\t\t⚠️ All group messages will be exposed — proceed with caution.\n\t\tℹ Guidelines: https://messagekit.ephemerahq.com/concepts/guidelines`,
      );
    }
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Logging new messages to console ↴`);
}
