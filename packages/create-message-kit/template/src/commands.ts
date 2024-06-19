interface CommandParamConfig {
  default?: any;
  type: "number" | "string" | "username" | "quoted" | "address";
  values?: string[]; // Accepted values for the parameter
}
interface CommandConfig {
  command: string;
  description: string;
  params: Record<string, CommandParamConfig>;
}

interface CommandGroup {
  name: string;
  icon: string;
  description: string;
  commands: CommandConfig[];
}

export const commands: CommandGroup[] = [
  {
    name: "Tipping",
    icon: "🎩",
    description: "Tip tokens via emoji, replies or command.",
    commands: [
      {
        command: "/help",
        description: "Get help with the app.",
        params: {},
      },
    ],
  },
];
