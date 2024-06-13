import { commands } from "./commands";
import { users } from "./users";
import { extractCommandValues } from "../../helpers/commands";

/*
interface CommandParamConfig {
  default?: any;
  type: "number" | "string" | "username" | "quoted" | "address";
  values?: string[]; // Accepted values for the parameter
}

interface CommandConfig {
  command: string;
  description: string;
  params: { [param: string]: CommandParamConfig };
}

interface CommandGroup {
  name: string;
  icon: string;
  description: string;
  commands: CommandConfig[];
}

describe("Command extraction tests", () => {
  test("Extract values from /tip command", () => {
    const inputContent = "/tip @john @fabri 15";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "tip",
      users: ["john", "fabri"],
      amount: 15,
    });
  });

  test("Extract values from /swap command", () => {
    const inputContent = "/swap 10 eth to usdc";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "swap",
      amount: 10,
      from: "eth",
      to: "usdc",
    });
  });

  test("Extract values from /send command", () => {
    const inputContent = "/send 10 usd @fabri";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "send",
      amount: 10,
      currency: "usd",
      user: "fabri",
    });
  });

  test("Extract values from /game command", () => {
    const inputContent = "/game slot";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({ command: "game", gameType: "slot" });
  });

  test("Extract values from /bet command", () => {
    const inputContent = "/bet @fabri @bob 'NBA Game' 100";
    const extractedValues = extractCommandValues(inputContent, commands, users);
    expect(extractedValues).toEqual({
      command: "bet",
      users: ["fabri", "bob"],
      event: "NBA Game",
      amount: 100,
    });
  });
});
*/
