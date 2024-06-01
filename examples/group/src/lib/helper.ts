interface CommandConfig {
  [command: string]: {
    params: { [param: string]: string[] }; // Possible values for each parameter
  };
}
interface ExtractedValues {
  command: string | undefined;
  params: { [key: string]: string | string[] | undefined };
}

export function extractCommandValues(
  content: string,
  commandConfig: CommandConfig,
): ExtractedValues {
  const parts = content.match(/[^\s"]+|"[^"]*"/g);

  console.log(parts);
  if (!parts) return { command: undefined, params: {} };

  let command = parts.find((part) =>
    Object.keys(commandConfig).includes(part.toLowerCase().replace(/^\//, "")),
  );
  if (command?.startsWith("/")) command = command.slice(1);

  if (!command) {
    console.log("No valid command found in the input.");
    return { command: undefined, params: {} };
  }

  const values: ExtractedValues = {
    command: command,
    params: {},
  };

  const expectedParams = commandConfig[command.toLowerCase()].params;
  const usedIndices: Set<number> = new Set();
  Object.keys(expectedParams).forEach((param) => {
    const possibleValues = expectedParams[param];
    if (possibleValues.length > 0) {
      const index = parts.findIndex(
        (part, idx) =>
          possibleValues.includes(part.toLowerCase()) && !usedIndices.has(idx),
      );
      if (index !== -1) {
        values.params[param] = parts[index];
        usedIndices.add(index);
      } else {
        // If no value is found and there is a default value, assign it
        if (expectedParams[param].length === 1) {
          values.params[param] = expectedParams[param][0];
        } else {
          console.error(`Expected parameter '${param}' not found.`);
        }
      }
    } else {
      // Handle numeric and other types of parameters
      switch (param) {
        case "amount":
          const numericIndex = parts.findIndex(
            (part, idx) => !isNaN(parseFloat(part)) && !usedIndices.has(idx),
          );
          if (numericIndex !== -1) {
            values.params[param] = parts[numericIndex];
            usedIndices.add(numericIndex);
          } else {
            console.error(`Expected numeric parameter '${param}' not found.`);
          }
          break;
        case "username":
          const usernames = parts.filter(
            (part, idx) => part.startsWith("@") && !usedIndices.has(idx),
          );
          if (usernames.length > 0) {
            values.params[param] = usernames;
            usernames.forEach((_, idx) => usedIndices.add(idx));
          } else {
            console.error(`Expected username parameter '${param}' not found.`);
          }
          break;
        case "name":
          const nameIndex = parts.findIndex(
            (part, idx) =>
              part.startsWith('"') &&
              part.endsWith('"') &&
              !usedIndices.has(idx),
          );
          if (nameIndex !== -1) {
            values.params[param] = parts[nameIndex].slice(1, -1); // Remove the surrounding quotes
            usedIndices.add(nameIndex);
          } else {
            console.error(`Expected name parameter '${param}' not found.`);
          }
          break;
        case "address":
          const addressIndex = parts.findIndex(
            (part, idx) => part.startsWith("0x") && !usedIndices.has(idx),
          );
          if (addressIndex !== -1) {
            values.params[param] = parts[addressIndex];
            usedIndices.add(addressIndex);
          } else {
            console.error(`Expected address parameter '${param}' not found.`);
          }
          break;
        default:
          console.error(`Unhandled parameter type '${param}'.`);
          break;
      }
    }
  });

  return values;
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
