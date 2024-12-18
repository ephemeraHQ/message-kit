import { Agent, Skill, SkillHandler } from "../helpers/types.js";
import { getUserInfo, type UserInfo } from "../plugins/resolver.js";
import { type Context } from "./core.js";
import { logMessage } from "../helpers/utils.js";

import path from "path";

export function findSkill(text: string, skills: Skill[][]): Skill | undefined {
  const trigger = text.split(" ")[0].toLowerCase();

  const handler = skills.flat().find((skill) => {
    return (
      "/" + skill.skill?.replace("/", "").split(" ")[0].toLowerCase() ===
      trigger
    );
  });

  return handler;
}

export function replaceSkills(agent: Agent) {
  let returnPrompt = `## Commands\n${agent?.skills
    ?.flat()
    .map(
      (skill) =>
        "/" +
        skill.skill?.replace("/", "").split(" ")[0] +
        " " +
        Object.keys(skill.params ?? {})
          .map((key) => {
            const paramConfig = skill.params?.[key];
            return `[${key}${paramConfig?.optional ? " (optional)" : ""}]`;
          })
          .join(" ") +
        " - " +
        skill.description,
    )
    .join("\n")}\n\n## Examples\n${agent?.skills
    ?.flat()
    .map((skill) => skill.examples?.join("\n"))
    .join("\n")}`;
  return returnPrompt;
}
export async function executeSkill(
  text: string,
  agent: Agent,
  context: Context,
) {
  try {
    let skillAction = findSkill(text, agent?.skills ?? []);
    const extractedValues = skillAction
      ? await parseSkill(text, skillAction)
      : undefined;
    if (
      (text.startsWith("/") || text.startsWith("@")) &&
      !extractedValues?.skill
    ) {
      console.warn("Skill not valid", text);
    } else if (skillAction?.handler) {
      // Mock context for skill execution
      const mockContext: Context = {
        ...context,
        message: {
          ...context.message,
          content: { ...context.message.content, ...extractedValues },
        },
      } as Context;

      // Copy all methods with proper binding
      Object.getOwnPropertyNames(Object.getPrototypeOf(context)).forEach(
        (key) => {
          const method = context[key as keyof Context];
          if (typeof method === "function") {
            (mockContext[key as keyof Context] as any) = method.bind(context);
          }
        },
      );

      if (skillAction?.handler) return skillAction.handler(mockContext);
    } else if (skillAction) {
      console.warn("No handler for", skillAction.skill);
      return context.send(text);
    } else if (text.startsWith("/") || text.startsWith("@")) {
      console.warn("Skill not valid", text);
    } else return context.send(text);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Skill execution failed: ${error.message}`);
    } else {
      console.error("Unknown error during skill execution:", error);
    }
    throw error;
  }
}

export async function parseSkill(
  text: string,
  skillAction: Skill,
): Promise<{
  skill: string | undefined;
  params: {
    [key: string]:
      | string
      | number
      | string[]
      | undefined
      | UserInfo
      | UserInfo[];
  };
}> {
  const defaultResult = {
    skill: undefined,
    params: {} as {
      [key: string]:
        | string
        | number
        | string[]
        | undefined
        | UserInfo
        | UserInfo[];
    },
  };
  try {
    if (!text.startsWith("/") && !text.startsWith("@"))
      return { skill: undefined, params: {} };

    if (typeof text !== "string") return defaultResult;

    // Replace all "“" and "”" with "'" and '"'
    text = text.replaceAll("“", '"').replaceAll("”", '"');

    const parts = text.match(/[^\s"']+|"([^"]*)"|'([^']*)'|`([^`]*)`/g);
    if (!parts) return defaultResult;
    let commandName = parts[0].startsWith("/")
      ? parts[0].slice(1).toLowerCase()
      : parts[0].toLowerCase();

    const values: {
      skill: string;
      params: {
        [key: string]:
          | string
          | number
          | string[]
          | undefined
          | UserInfo
          | UserInfo[];
      };
    } = {
      skill: commandName,
      params: {},
    };

    const expectedParams = skillAction.params || {};
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
        const userParts = await parts.reduce<Promise<UserInfo[]>>(
          async (acc, part, idx) => {
            const result: UserInfo[] = await acc;
            if (!usedIndices.has(idx)) {
              // Check for valid patterns:
              // 1. Ethereum addresses: 0x...
              // 2. ENS domains: *.eth
              // 3. Usernames: @username
              if (
                /^0x[a-fA-F0-9]{40}$/.test(part) || // ETH address
                /^[a-zA-Z0-9-]+\.eth$/.test(part) || // ENS domain
                /^@[a-zA-Z][a-zA-Z0-9_-]*$/.test(part) // Username
              ) {
                usedIndices.add(idx);
                // Handle potential comma-separated values
                const users = part.split(",");
                for (const user of users) {
                  let userInfo = await getUserInfo(user);
                  if (userInfo?.address) {
                    result.push(userInfo);
                  }
                }
              }
            }
            return result;
          },
          Promise.resolve([]),
        );

        if (userParts.length > 0) {
          values.params[param] = plural ? userParts : userParts[0];
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
        const numberIndex = parts.findIndex(
          (part, idx) =>
            !usedIndices.has(idx) && !Number.isNaN(parseFloat(part)),
        );
        if (numberIndex !== -1) {
          values.params[param] = parseFloat(parts[numberIndex]);
          usedIndices.add(numberIndex);
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
      if (!valueFound && defaultValue !== undefined) {
        if (
          typeof defaultValue === "string" ||
          typeof defaultValue === "number" ||
          Array.isArray(defaultValue)
        ) {
          values.params[param] = defaultValue;
        }
      }
    }

    return values;
  } catch (e) {
    console.error(e);
    return defaultResult;
  }
}

export async function loadSkillsFile(): Promise<Agent> {
  const resolvedPath = path.resolve(process.cwd(), "dist/skills.js");

  let agent: Agent = {
    name: "",
    tag: "",
    description: "",
  };
  try {
    const module = await import(resolvedPath);
    agent = module?.agent;
    return agent;
  } catch (error) {
    //console.error(`Error loading command config from ${resolvedPath}:`);
  }
  return agent;
}

export async function filterMessage(
  context: Context,
  isV2: boolean,
): Promise<{
  isMessageValid: boolean;
  customHandler: SkillHandler | undefined;
}> {
  const {
    message: {
      content: { text },
      content,
      typeId,
      sender,
    },
    client,
    v2client,
    xmtp,
    agent,
    group,
  } = context;

  //Reserved
  if (context.message.content.text?.startsWith("/reset")) {
    context.clearMemory(sender?.address);
    //context.clearCache(sender?.address);
    context.send("Memory cleared");
    return { isMessageValid: false, customHandler: undefined };
  }

  let foundSkill = text?.startsWith("/")
    ? findSkill(text, agent?.skills ?? [])
    : undefined;

  const { inboxId: senderInboxId } = client;
  const { address: senderAddress } = v2client;

  const isSameAddress =
    sender.address?.toLowerCase() === senderAddress?.toLowerCase() ||
    (sender.inboxId?.toLowerCase() === senderInboxId.toLowerCase() &&
      typeId !== "group_updated");

  const isSkillTriggered = foundSkill?.skill;
  const iscommunity = agent.config?.experimental ?? false;

  const isAddedMemberOrPass =
    typeId === "group_updated" &&
    agent.config?.memberChange &&
    //@ts-ignore
    content?.addedInboxes?.length === 0
      ? false
      : true;

  const isRemoteAttachment = typeId == "remoteStaticAttachment";

  const isAdminSkill = foundSkill?.adminOnly ?? false;

  const isAdmin =
    group &&
    (group?.admins.includes(sender.inboxId) ||
      group?.superAdmins.includes(sender.inboxId))
      ? true
      : false;

  const isAdminOrPass = isAdminSkill && !isAdmin ? false : true;

  // Remote attachments work if image:true in runner config
  // Replies only work with explicit mentions from triggers.
  // Text only works with explicit mentions from triggers.
  // Reactions don't work with triggers.

  const isImageValid = isRemoteAttachment && agent.config?.attachments;

  const acceptedType = [
    "text",
    "remoteStaticAttachment",
    "reply",
    "skill",
  ].includes(typeId ?? "");
  // Check if the message content triggers a tag
  let botTag = (await getUserInfo(client.accountAddress))?.converseUsername;
  const isTagged =
    text?.toLowerCase()?.includes(agent?.tag?.toLowerCase() ?? "") ??
    text?.toLowerCase()?.includes(botTag?.toLowerCase() ?? "");

  const isMessageValid = isSameAddress
    ? false
    : // v2 only accepts text, remoteStaticAttachment, reply
      isV2 && acceptedType
      ? true
      : //If its image is also good, if it has a skill image:true
        isImageValid
        ? true
        : //If its not an admin, nope
          !isAdminOrPass
          ? false
          : iscommunity
            ? true
            : //If its a group update but its not an added member, nope
              !isAddedMemberOrPass
              ? false
              : //If it has a skill trigger, good
                isSkillTriggered
                ? true
                : //If it has a tag trigger, good
                  isTagged
                  ? true
                  : false;

  if (process.env.MSG_LOG === "true") {
    logMessage({
      isSameAddress,
      openai: {
        model: process?.env?.GPT_MODEL,
        key: process?.env?.OPENAI_API_KEY ? "[SET]" : "[NOT SET]",
      },
      content,
      acceptedType,
      attachmentDetails: {
        isRemoteAttachment,
        isImageValid,
      },
      adminDetails: {
        isAdminSkill,
        isAdmin,
        isAdminOrPass,
      },
      isAddedMemberOrPass,
      skillsParsed: agent?.skills?.length,
      taggingDetails: {
        tag: agent?.tag,
        isTagged,
      },
      skillTriggerDetails: isSkillTriggered
        ? {
            skill: foundSkill?.skill,
            examples: foundSkill?.examples,
            description: foundSkill?.description,
            params: foundSkill?.params
              ? Object.entries(foundSkill.params).map(([key, value]) => ({
                  key,
                  value: {
                    type: value.type,
                    values: value.values,
                    plural: value.plural,
                    default: value.default,
                  },
                }))
              : undefined,
          }
        : !text?.startsWith("/")
          ? "Natural prompt, yet to be parsed"
          : "No skill trigger detected",
      isMessageValid,
    });
  }
  if (isMessageValid) {
    logMessage(`msg_${isV2 ? "v2" : "v3"}: ` + (text ?? typeId));
  }

  return {
    isMessageValid,
    customHandler: foundSkill?.handler,
  };
}
