import { default as HandlerContext } from "../lib/handlerContext.js";
import { DecodedMessage } from "@xmtp/xmtp-js";
import {
  ClientOptions,
  DecodedMessage as DecodedMessageV2,
} from "@xmtp/node-sdk";
import { ContentTypeId } from "@xmtp/content-type-primitives";
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
export type GroupAbstracted = {
  id: string;
  sync: () => Promise<void>;
  addMembers: (addresses: string[]) => Promise<void>;
  addMembersByInboxId: (inboxIds: string[]) => Promise<void>;
  removeMembers: (addresses: string[]) => Promise<void>;
  removeMembersByInboxId: (inboxIds: string[]) => Promise<void>;
  send: (content: string, contentType?: ContentTypeId) => Promise<string>;
  createdAt: Date;
};

export type CommandHandler = (context: HandlerContext) => Promise<void>;

export type Handler = (context: HandlerContext) => Promise<void>;

export type Config = {
  client?: ClientOptions;
  privateKey?: string;
  commandsConfigPath?: string;
};
export interface CommandParamConfig {
  default?: string | number | boolean;
  type: "number" | "string" | "username" | "quoted" | "address" | "prompt";
  values?: string[]; // Accepted values for the parameter
}

export interface CommandGroup {
  name: string;
  triggers: string[];
  image?: boolean;
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
  installationIds?: string[];
  fake?: boolean;
}

export type MetadataValue = string | number | boolean;
export type Metadata = Record<string, MetadataValue | MetadataValue[]>;
