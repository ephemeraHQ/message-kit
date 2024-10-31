import { CommandGroup, CommandConfig, User } from "./types";
import path from "path";
import fs from "fs";
import { Client } from "@xmtp/node-sdk";
import { Config } from "./types";

export function parseCommand(
  content: string,
  commands: CommandGroup[],
  members: User[],
) {
  let contentReturn;

  //If is command of other bot. MULTIBOT
  const firstWord = content?.split(" ")[0];
  if (
    (firstWord.startsWith("/") && !firstWord.includes("@")) ||
    (firstWord.startsWith("/") && firstWord.includes("@"))
  ) {
    const extractedValues = extractCommandValues(
      content,
      commands ?? [],
      members ?? [],
    );

    contentReturn = {
      content: content,
      ...extractedValues,
    };
  } else {
    contentReturn = {
      content: content,
    };
  }
  return contentReturn;
}

export function extractCommandValues(
  content: string,
  commands: CommandGroup[],
  members: User[],
): {
  command: string | undefined;
  params: { [key: string]: string | number | string[] | undefined };
} {
  const defaultResult = {
    command: undefined,
    params: {} as { [key: string]: string | number | string[] | undefined },
  };
  try {
    if (typeof content !== "string") return defaultResult;

    // Replace all "“" and "”" with "'" and '"'
    content = content.replaceAll("“", '"').replaceAll("”", '"');

    const parts = content.match(/[^\s"']+|"([^"]*)"|'([^']*)'|`([^`]*)`/g);
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

    Object.keys(expectedParams).forEach((param) => {
      const {
        values: possibleValues = [],
        default: defaultValue,
        type = "string",
      } = expectedParams[param];
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
      } else if (type === "address") {
        const addressIndex = parts.findIndex(
          (part, idx) =>
            /^0x[a-fA-F0-9]{40}$/.test(part) && !usedIndices.has(idx),
        );
        if (addressIndex !== -1) {
          values.params[param] = parts[addressIndex];
          usedIndices.add(addressIndex);
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
      } else {
        const indices = parts.reduce<number[]>((acc, part, idx) => {
          if (
            !usedIndices.has(idx) &&
            (type === "number"
              ? !isNaN(parseFloat(part))
              : type === "username"
                ? part.startsWith("@")
                : true)
          ) {
            acc.push(idx);
          }
          return acc;
        }, []);

        if (indices.length > 0) {
          if (type === "username") {
            const usernames = indices.map((idx) => parts[idx].slice(1));
            const mappedUsers = mapUsernamesToInboxId(usernames, members);
            //@ts-ignore
            values.params[param] = mappedUsers.filter(
              (user) => user !== undefined,
            );
            indices.forEach((idx) => usedIndices.add(idx));
          } else {
            values.params[param] =
              type === "number"
                ? parseFloat(parts[indices[0]])
                : parts[indices[0]];
            usedIndices.add(indices[0]);
          }
          valueFound = true;
        }
      }

      if (!valueFound && defaultValue !== undefined) {
        //@ts-ignore
        values.params[param] = defaultValue;
      }
    });

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
  const resolvedPath = path.resolve(process.cwd(), "src/" + "commands.ts");

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
    Warnings:
    ${config?.attachments ? `- ⚠️ Attachments are enabled` : ""}
    ${config?.memberChange ? `- ⚠️ Member changes are enabled` : ""}
    ${!fs.existsSync(resolvedPath) ? `- ⚠️ No commands.ts file found` : ""}
    ${
      config?.experimental
        ? `- ☣️ EXPERIMENTAL MODE ENABLED:
        ⚠️ All group messages will be exposed — proceed with caution.
        ℹ Guidelines: https://messagekit.ephemerahq.com/guidelines`
        : ""
    }
        \x1b[0m`);
    }
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Logging new messages to console ↴`);
  }
}

export function mapUsernamesToInboxId(
  usernames: string[],
  users: User[],
): User[] {
  return usernames
    .map((username) => {
      return users.find((user) => user.username === username.replace("@", ""));
    })
    .filter((user): user is User => user !== null);
}
