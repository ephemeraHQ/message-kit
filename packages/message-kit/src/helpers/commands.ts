import { CommandGroup, CommandConfig, User } from "./types";

function mapUsernamesToAddresses(
  usernames: string[],
  users: User[],
): { name: string; address: string }[] {
  return usernames
    .map((username) => {
      const user = users.find(
        (user) => user.username === username.replace("@", ""),
      );
      return user ? { name: user.username, address: user.address } : null;
    })
    .filter((user): user is { name: string; address: string } => user !== null);
}
export function extractCommandValues(
  content: string,
  commands: CommandGroup[],
  users: User[],
): {
  command: string | undefined;
  params: { [key: string]: any };
} {
  const defaultResult = {
    command: undefined,
    params: {} as { [key: string]: any },
  };

  try {
    if (typeof content !== "string") return defaultResult;

    const parts = content.match(/[^\s"']+|"([^"]*)"|'([^']*)'|`([^`]*)`/g);
    if (!parts) return defaultResult;

    let commandName = parts[0].startsWith("/") ? parts[0].slice(1) : parts[0];
    let commandConfig: CommandConfig | undefined;

    for (const group of commands) {
      commandConfig = group.commands.find((cmd) =>
        cmd.command.startsWith(`/${commandName}`),
      );
      if (commandConfig) break;
    }

    if (!commandConfig) return defaultResult;

    const values: { command: string; params: { [key: string]: any } } = {
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

      if (type === "quoted") {
        const quotedIndex = parts.findIndex(
          (part, idx) => /^["'`].*["'`]$/.test(part) && !usedIndices.has(idx),
        );
        if (quotedIndex !== -1) {
          values.params[param] = parts[quotedIndex].slice(1, -1);
          usedIndices.add(quotedIndex);
          valueFound = true;
        }
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
            const mappedUsers = mapUsernamesToAddresses(usernames, users);
            values.params[param] = mappedUsers; // Directly assign the array of mapped users
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
        values.params[param] = defaultValue;
      }
    });

    return values;
  } catch (e) {
    console.error(e);
    return defaultResult;
  }
}
