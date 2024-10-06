import { default as HandlerContext } from "../lib/handlerContext.js";

import { ClientOptions } from "@xmtp/mls-client";

// Define a type for the message that includes the conversation property
export type MessageAbstracted = {
  id: string;
  sent: Date;
  content: any;
  version: string;
  sender: {
    inboxId: string;
    username: string;
    address: string;
    accountAddresses: string[];
  };
  typeId: string;
};

export type CommandHandler = (context: HandlerContext) => Promise<void>;

// Define a new type for the command handlers object
export type CommandHandlers = {
  [command: string]: CommandHandler;
};

export type Handler = (context: HandlerContext) => Promise<void>;

export type Config = {
  client?: ClientOptions;
  privateKey?: string;
  commandsConfigPath?: string;
  commandHandlers?: CommandHandlers;
};
export interface CommandParamConfig {
  default?: any;
  type: "number" | "string" | "username" | "quoted" | "address" | "prompt";
  values?: string[]; // Accepted values for the parameter
}

export interface CommandGroup {
  name: string;
  icon: string;
  triggers: string[];
  description: string;
  commands: CommandConfig[];
}

export interface CommandConfig {
  command: string;
  handler?: CommandHandler;
  description: string;
  params: Record<string, CommandParamConfig>;
}

export interface User {
  inboxId: string; // Ensure this is always a string
  username: string;
  address: string;
  accountAddresses: string[];
  installationIds: string[];
  fake?: boolean;
}

export type MetadataValue = string | number | boolean;
export type Metadata = Record<string, MetadataValue | MetadataValue[]>;
