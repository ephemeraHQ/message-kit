import { SkillGroup, SkillCommand } from "../helpers/types.js";
import { HandlerContext } from "./handlerContext";
import path from "path";

export function findSkill(
  text: string,
  skills: SkillGroup[],
): SkillCommand | undefined {
  const trigger = text?.split(" ")[0].toLowerCase();
  for (const skillGroup of skills) {
    const handler = skillGroup.skills.find((skill) => {
      return skill?.triggers?.includes(trigger);
    });
    if (handler !== undefined) return handler;
  }
  return undefined;
}

export async function executeSkill(text: string, context: HandlerContext) {
  // Use the custom text parameter
  let skills = context.skills;
  let conversation = context.conversation;
  try {
    let skillCommand = findSkill(text, skills ?? []);
    const extractedValues = parseSkill(text, skills ?? []);
    if ((text.startsWith("/") || text.startsWith("@")) && !extractedValues) {
      console.warn("Command not valid", text);
    } else if (skillCommand && skillCommand.handler) {
      // Mock context for command execution
      const mockContext: HandlerContext = {
        ...context,
        conversation: conversation ?? context.conversation,
        getV2MessageById: context.getV2MessageById.bind(context),
        isConversationV2: context.isConversationV2.bind(context),
        getCacheCreationDate: context.getCacheCreationDate.bind(context),
        message: {
          ...context.message,
          content: {
            ...context.message.content,
            ...extractedValues,
          },
        },
        executeSkill: context.executeSkill.bind(context),
        reply: context.reply.bind(context),
        send: context.send.bind(context),
        sendTo: context.sendTo.bind(context),
        react: context.react.bind(context),
        getMessageById: context.getMessageById.bind(context),
        getReplyChain: context.getReplyChain.bind(context),
      };

      if (skillCommand?.handler) return skillCommand.handler(mockContext);
    } else if (skillCommand) {
      console.warn("No handler for", skillCommand.command);
      return context.send(text);
    } else if (text.startsWith("/") || text.startsWith("@")) {
      console.warn("Command not valid", text);
    } else return context.send(text);
  } catch (e) {
    console.log("error", e);
  } finally {
    context.refConv = null;
  }
}

export function findSkillGroup(
  content: string,
  skills: SkillGroup[],
): SkillGroup | undefined {
  let skillList = skills;
  return skillList?.find((skill) => {
    console.log("skill", skill.tag, content?.includes(`${skill.tag}`));
    if (skill.tag && content?.includes(`${skill.tag}`)) {
      return true;
    }
    return undefined;
  });
}

export function parseSkill(
  text: string,
  skills: SkillGroup[],
): {
  command: string | undefined;
  params: { [key: string]: string | number | string[] | undefined };
} {
  if (!text.startsWith("/")) return { command: undefined, params: {} };

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
    let commandName = parts[0].startsWith("/")
      ? parts[0].slice(1).toLowerCase()
      : parts[0].toLowerCase();

    let commandConfig: SkillCommand | undefined = undefined;

    for (const group of skills) {
      commandConfig = group.skills.find((cmd) =>
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
      const {
        type,
        values: possibleValues = [],
        plural = false,
        default: defaultValue,
      } = paramConfig;

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
      } else if (type === "url") {
        const urlIndex = parts.findIndex(
          (part, idx) => /^https?:\/\//.test(part) && !usedIndices.has(idx),
        );
        if (urlIndex !== -1) {
          values.params[param] = parts[urlIndex];
          usedIndices.add(urlIndex);
          valueFound = true;
        }
      } else if (type === "prompt") {
        values.params[param] = parts.slice(1).join(" ");
        valueFound = true;
      } else if (type === "username") {
        // Updated regular expression to ensure usernames start with @
        const usernameParts = parts.reduce<string[]>((acc, part, idx) => {
          if (
            !usedIndices.has(idx) &&
            (/^@[a-zA-Z][a-zA-Z0-9_-]*$/.test(part) ||
              /^[a-zA-Z0-9-]+\.eth$/.test(part)) // Ensure it starts with @ or is a .eth domain
          ) {
            usedIndices.add(idx);
            // Handle potential comma-separated values
            const usernames = part.split(",");
            acc.push(...usernames);
          }
          return acc;
        }, []);

        if (usernameParts.length > 0) {
          values.params[param] = plural ? usernameParts : usernameParts[0];
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
      // If no value was found, set the default value if it exists
      if (!valueFound && defaultValue !== undefined) {
        //@ts-ignore
        values.params[param] = defaultValue;
      }
    }

    return values;
  } catch (e) {
    console.error(e);
    return defaultResult;
  }
}

export async function loadSkillsFile(
  configPath: string = "skills.js",
): Promise<SkillGroup[]> {
  const resolvedPath = path.resolve(process.cwd(), "dist/" + configPath);
  let skills: SkillGroup[] = [];
  try {
    const module = await import(resolvedPath);
    skills = module?.skills;
  } catch (error) {
    // if (process.env.MSG_LOG === "true")
    //   console.error(`Error loading command config from ${resolvedPath}:`);
  }
  if (skills === undefined || skills?.length === 0) return [];
  return skills;
}
