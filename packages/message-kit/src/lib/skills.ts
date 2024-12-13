import { Agent, Skill } from "../helpers/types.js";
import { type Context } from "./core.js";
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
      ? parseSkill(text, skillAction)
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
  } finally {
    context.refConv = undefined;
  }
}

export function parseSkill(
  text: string,
  skillAction: Skill,
): {
  skill: string | undefined;
  params: { [key: string]: string | number | string[] | undefined };
} {
  const defaultResult = {
    skill: undefined,
    params: {} as { [key: string]: string | number | string[] | undefined },
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
        [key: string]: string | number | string[] | undefined; // Removed boolean type
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
