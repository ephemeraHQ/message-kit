import { default as HandlerContext } from "../lib/handlerContext.js";

// Define a type for the message that includes the conversation property
export type MessageAbstracted = {
  id: string;
  sent: Date;
  content: any;
  senderAddress: string;
  senderInboxId?: string;
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
  params: Record<string, CommandParamConfig>;
}

export interface CommandGroup {
  name: string;
  icon: string;
  description: string;
  commands: CommandConfig[];
}

export interface User {
  address: string;
  username?: string;
  inboxId?: string;
  accountAddresses?: Array<string>;
  installationIds?: Array<string>;
}

export type MetadataValue = string | number | boolean;
export type Metadata = Record<string, MetadataValue | MetadataValue[]>;

export type AccessHandler = (context: HandlerContext) => Promise<boolean>;
export type Handler = (context: HandlerContext) => Promise<void>;
