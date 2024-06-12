// Define a type for the message that includes the conversation property
export type MessageAbstracted = {
  id: string;
  sent: Date;
  content: any;
  senderAddress: string;
  typeId: string;
};

export interface CommandParamConfig {
  default?: any;
  type: "number" | "string" | "username" | "quoted" | "address";
  values?: string[]; // Accepted values for the parameter
}

export interface CommandConfig {
  command: string;
  description: string;
  params: { [param: string]: CommandParamConfig };
}

export interface CommandGroup {
  name: string;
  icon: string;
  description: string;
  commands: CommandConfig[];
}

export interface User {
  username: string;
  address: string;
  tokens: number;
}
