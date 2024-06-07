interface CommandConfig {
  [command: string]: {
    params: { [param: string]: string[] }; // Possible values for each parameter
  };
}
interface ExtractedValues {
  command: string | undefined;
  params: { [key: string]: string | number | string[] | undefined };
}

export function extractCommandValues(
  content: string,
  commands: any,
): ExtractedValues {
  try {
    if (typeof content !== "string") return { command: undefined, params: {} };

    const parts = content.match(/[^\s"']+|"([^"]*)"|'([^']*)'|`([^`]*)`/g);
    console.log(parts);
    if (!parts) return { command: undefined, params: {} };

    // Extract the command name from the input
    let commandName = parts[0].startsWith("/") ? parts[0].slice(1) : parts[0];
    let commandConfig;

    // Find the command configuration that matches the command name
    for (const group of commands) {
      for (const cmd of group.commands) {
        if (cmd.command.startsWith(`/${commandName}`)) {
          commandConfig = cmd;
          break;
        }
      }
      if (commandConfig) break;
    }

    if (!commandConfig) {
      console.log("No valid command found in the input.");
      return { command: undefined, params: {} };
    }
    //console.log(commandConfig);
    const values: ExtractedValues = { command: commandName, params: {} };
    // Extract parameters based on the command configuration
    const expectedParams = (commandConfig as any).params;
    const usedIndices: Set<number> = new Set();
    if (!expectedParams || !Object.keys(expectedParams).length) {
      return { command: commandName, params: {} };
    }

    Object.keys(expectedParams).forEach((param) => {
      const paramDetails = expectedParams[param];
      const possibleValues = paramDetails.values || [];
      const defaultValue = paramDetails.default;
      const paramType = paramDetails.type || "string"; // Default type is string if not specified

      //console.log(`Processing param: ${param} of type ${paramType}`);

      if (paramType === "quoted") {
        // Find index of the part that matches any of the quote types
        const quotedIndex = parts.findIndex(
          (part, idx) =>
            ((part.startsWith('"') && part.endsWith('"')) ||
              (part.startsWith("'") && part.endsWith("'")) ||
              (part.startsWith("`") && part.endsWith("`"))) &&
            !usedIndices.has(idx),
        );
        if (quotedIndex !== -1) {
          // Remove the quotes and add to values
          values.params[param] = parts[quotedIndex].slice(1, -1);
          usedIndices.add(quotedIndex);
        } else if (defaultValue !== undefined) {
          values.params[param] = defaultValue;
        } else {
          console.error(`Expected quoted parameter '${param}' not found.`);
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
        } else if (defaultValue !== undefined) {
          values.params[param] = defaultValue;
        } else {
          console.error(`Expected parameter '${param}' not found.`);
        }
      } else {
        // Handle different types of parameters based on the type specified
        switch (paramType) {
          case "number":
            const numericIndex = parts.findIndex(
              (part, idx) => !isNaN(parseFloat(part)) && !usedIndices.has(idx),
            );
            if (numericIndex !== -1) {
              values.params[param] = parseFloat(parts[numericIndex]);
              usedIndices.add(numericIndex);
            } else if (defaultValue !== undefined) {
              values.params[param] = defaultValue;
            } else {
              console.error(`Expected numeric parameter '${param}' not found.`);
            }
            break;
          case "username":
            const usernames = parts.filter(
              (part, idx) => part.startsWith("@") && !usedIndices.has(idx),
            );
            if (usernames.length > 0) {
              values.params[param] = usernames.map((username) =>
                username.slice(1),
              ); // Remove '@'
              usernames.forEach((_, idx) => usedIndices.add(idx));
            } else if (defaultValue !== undefined) {
              values.params[param] = defaultValue;
            } else {
              console.error(
                `Expected username parameter '${param}' not found.`,
              );
            }
            break;
          default:
            if (defaultValue !== undefined) {
              values.params[param] = defaultValue;
            } else {
              console.error(`Unhandled parameter type '${param}'.`);
            }
            break;
        }
      }
    });
    return values;
  } catch (e) {
    console.log(e);
    return { command: undefined, params: {} };
  }
}

export function mapUsernamesToAddresses(
  usernames: string[],
  users: any[],
): string[] {
  return usernames
    .map((username) => {
      const user = users.find(
        (user) => user.username === username.replace("@", ""),
      );
      return user ? user.address : "";
    })
    .filter((address) => address !== "");
}
export function generateFrameURL(
  baseUrl: string,
  transaction_type: string,
  params: any,
) {
  // Filter out undefined parameters
  let filteredParams: { [key: string]: any } = {};

  for (const key in params) {
    if (params[key] !== undefined) {
      filteredParams[key] = params[key];
    }
  }
  let queryParams = new URLSearchParams({
    transaction_type,
    ...filteredParams,
  }).toString();
  return `${baseUrl}?${queryParams}`;
}
