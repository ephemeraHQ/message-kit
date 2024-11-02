import { AgentSkill, CommandConfig } from "./types";
import path from "path";
import fs from "fs";
import { Client } from "@xmtp/node-sdk";
import { Config } from "./types";

export function parseCommand(text: string, commands: AgentSkill[]) {
  //If is command of other bot. MULTIBOT
  const firstWord = text.split(" ")[0];
  if (firstWord.startsWith("/")) {
    return extractCommandValues(text, commands ?? []);
  }
  return null;
}

export function extractCommandValues(
  text: string,
  commands: AgentSkill[],
): {
  command: string | undefined;
  params: { [key: string]: string | number | string[] | undefined };
} {
  const defaultResult = {
    command: undefined,
    params: {} as { [key: string]: string | number | string[] | undefined },
  };
  try {
    if (typeof text !== "string") return defaultResult;

    // Replace all "“" and "”" with "'" and '"'
    text = text.replaceAll("“", '"').replaceAll("”", '"');

    const parts = text.match(/[^\s"']+|"([^"]*)"|'([^']*)'|`([^`]*)`/g);
    if (!parts) return defaultResult;

    let commandName = parts[0].startsWith("/") ? parts[0].slice(1) : parts[0];
    let commandConfig: CommandConfig | undefined = undefined;

    for (const group of commands) {
      commandConfig = group.commands.find((cmd) =>
        cmd.command.startsWith(`/${commandName}`),
      );
      if (commandConfig) break;
    }

    if (!commandConfig) return defaultResult;

    const values: {
      command: string;
      params: { [key: string]: string | number | string[] | undefined };
    } = {
      command: commandName,
      params: {},
    };
    const expectedParams = commandConfig.params || {};
    const usedIndices = new Set();

    for (const [param, paramConfig] of Object.entries(expectedParams)) {
      const { type, values: possibleValues = [] } = paramConfig;

      let valueFound = false;
      // Handle string type with no possible values
      if (type === "string" && possibleValues.length === 0) {
        const stringIndex = parts.findIndex(
          (part, idx) => !usedIndices.has(idx) && idx > 0,
        );
        if (stringIndex !== -1) {
          values.params[param] = parts[stringIndex];
          usedIndices.add(stringIndex);
          valueFound = true;
        }
      } else if (type === "quoted") {
        const quotedIndex = parts.findIndex(
          (part, idx) => /^["'`].*["'`]$/.test(part) && !usedIndices.has(idx),
        );
        if (quotedIndex !== -1) {
          values.params[param] = parts[quotedIndex].slice(1, -1);
          usedIndices.add(quotedIndex);
          valueFound = true;
        }
      } else if (type === "prompt") {
        values.params[param] = parts.slice(1).join(" ");
        valueFound = true;
      } else if (type === "username") {
        // Updated regular expression to exclude numeric strings
        const usernameParts = parts.reduce<string[]>((acc, part, idx) => {
          if (
            !usedIndices.has(idx) &&
            /^@?[a-zA-Z][a-zA-Z0-9_-]*$/.test(part)
          ) {
            usedIndices.add(idx);
            // Remove @ prefix and handle potential comma-separated values
            const usernames = part.split(",");
            acc.push(...usernames);
          }
          return acc;
        }, []);

        if (usernameParts.length > 0) {
          values.params[param] =
            usernameParts.length === 1 ? usernameParts[0] : usernameParts;
          valueFound = true;
        }
      } else if (type === "ens") {
        // Handle comma-separated ENS domains
        const ensParts = parts.reduce<string[]>((acc, part, idx) => {
          if (!usedIndices.has(idx) && /^[a-zA-Z0-9-]+\.eth$/.test(part)) {
            usedIndices.add(idx);
            const domains = part.split(",").map((d) => d.trim());
            acc.push(...domains);
          }
          return acc;
        }, []);

        if (ensParts.length > 0) {
          values.params[param] = ensParts.length === 1 ? ensParts[0] : ensParts;
          valueFound = true;
        }
      } else if (type === "address") {
        // Handle comma-separated addresses
        const addressParts = parts.reduce<string[]>((acc, part, idx) => {
          if (!usedIndices.has(idx) && /^0x[a-fA-F0-9]{40}$/.test(part)) {
            usedIndices.add(idx);
            const addresses = part.split(",").map((a) => a.trim());
            acc.push(...addresses);
          }
          return acc;
        }, []);

        if (addressParts.length > 0) {
          values.params[param] =
            addressParts.length === 1 ? addressParts[0] : addressParts;
          valueFound = true;
        }
      } else if (type === "number") {
        // Handle comma-separated numbers
        const numberParts = parts.reduce<number[]>((acc, part, idx) => {
          if (!usedIndices.has(idx) && !isNaN(parseFloat(part))) {
            usedIndices.add(idx);
            const numbers = part
              .split(",")
              .map((n) => parseFloat(n.trim()))
              .filter((n) => !isNaN(n));
            acc.push(...numbers);
          }
          return acc;
        }, []);

        if (numberParts.length > 0) {
          //@ts-ignore
          values.params[param] =
            numberParts.length === 1 ? numberParts[0] : numberParts;
          valueFound = true;
        }
      } else if (possibleValues.length > 0) {
        const index = parts.findIndex(
          (part, idx) =>
            possibleValues.includes(part.toLowerCase()) &&
            !usedIndices.has(idx),
        );
        if (index !== -1) {
          values.params[param] = parts[index];
          usedIndices.add(index);
          valueFound = true;
        }
      }
    }

    return values;
  } catch (e) {
    console.error(e);
    return defaultResult;
  }
}

export const shorterLogMessage = (message: string) => {
  return message?.substring(0, 60) + (message?.length > 60 ? "..." : "");
};

export const logMessage = (message: string) => {
  if (process.env.MSG_LOG === "false") return;
  console.log(shorterLogMessage(message));
};

export function logInitMessage(client: Client, config?: Config) {
  const resolvedPath = path.resolve(process.cwd(), "src/" + "skills.ts");

  if (process.env.NODE_ENV !== "production") {
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

    if (
      config?.experimental ||
      config?.attachments ||
      config?.memberChange ||
      !fs.existsSync(resolvedPath)
    ) {
      console.warn(`\x1b[33m
    Warnings:`);
      if (config?.attachments) {
        console.warn("\t- ⚠️ Attachments are enabled");
      }
      if (config?.memberChange) {
        console.warn("\t- ⚠️ Member changes are enabled");
      }
      if (!fs.existsSync(resolvedPath)) {
        console.warn("\t- ⚠️ No skills.ts file found");
      }
      if (config?.experimental) {
        console.warn(
          `\t- ☣️ EXPERIMENTAL MODE ENABLED:
        \t\t⚠️ All group messages will be exposed — proceed with caution.
        \t\tℹ Guidelines: https://messagekit.ephemerahq.com/guidelines`,
        );
      }
    }
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Logging new messages to console ↴`);
  }
}
