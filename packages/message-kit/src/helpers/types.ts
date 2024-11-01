import { default as HandlerContext } from "../lib/handlerContext.js";
import { ClientOptions } from "@xmtp/node-sdk";
import { ContentTypeId } from "@xmtp/content-type-primitives";

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
  send: (content: string, contentType?: ContentTypeId) => Promise<string>;
  isAdmin: (inboxId: string) => boolean;
  isSuperAdmin: (inboxId: string) => boolean;
  createdAt: Date;
};
export type ApiResponse = {
  code: number;
  message: string;
};

export type CommandHandler = (
  context: HandlerContext,
) => Promise<void | ApiResponse>;

export type Handler = (context: HandlerContext) => Promise<void>;

export type Config = {
  client?: ClientOptions;
  privateKey?: string;
  experimental?: boolean;
  commandsConfigPath?: string;
  hideLog?: boolean;
  attachments?: boolean;
  memberChange?: boolean;
};
export interface CommandParamConfig {
  default?: string | number | boolean;
  type: "number" | "string" | "username" | "quoted" | "address" | "prompt";
  values?: string[]; // Accepted values for the parameter
}

export interface AgentSkill {
  name: string;
  image?: boolean;
  description: string;
  commands: CommandConfig[];
}

export interface CommandConfig {
  command: string;
  handler?: CommandHandler;
  triggers: string[];
  adminOnly?: boolean;
  description: string;
  example?: string;
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
