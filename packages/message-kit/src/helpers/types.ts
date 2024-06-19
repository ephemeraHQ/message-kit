import { default as HandlerContextV3 } from "../lib-mls/handlerContext.js";
import { default as HandlerContextV2 } from "../v2/handlerContext.js";

// Define a type for the message that includes the conversation property
export type MessageAbstracted = {
  id: string;
  sent: Date;
  content: any;
  sender: string;
  typeId: string;
};

// Define a type for the message that includes the conversation property
export type MessageAbstractedV2 = {
  id: string;
  sent: Date;
  content: any;
  senderAddress: string;
  typeId: string;
};
export type BotConfig = {
  users?: User[];
  commands?: CommandGroup[];
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

export type HandlerContext = HandlerContextV2 | HandlerContextV3;
export type AccessHandler = (context: HandlerContext) => Promise<boolean>;
export type Handler = (context: HandlerContext) => Promise<void>;
