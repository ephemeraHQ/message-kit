import { default as HandlerContext } from "../lib/handlerContext.js";
import { ClientOptions } from "@xmtp/node-sdk";
import { ContentTypeId } from "@xmtp/content-type-primitives";

export type MessageAbstracted = {
  id: string;
  sent: Date;
  content: any;
  version: "v2" | "v3";
  sender: any;
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

export type SkillHandler = (
  context: HandlerContext,
) => Promise<void | ApiResponse>;

export type Handler = (context: HandlerContext) => Promise<void>;

export type Config = {
  client?: ClientOptions;
  privateKey?: string;
  experimental?: boolean;
  skillsConfigPath?: string;
  hideLog?: boolean;
  attachments?: boolean;
  memberChange?: boolean;
};
export interface SkillParamConfig {
  default?: string | number | boolean;
  type:
    | "number"
    | "string"
    | "username"
    | "quoted"
    | "address"
    | "prompt"
    | "url";
  plural?: boolean;
  values?: string[]; // Accepted values for the parameter
}

export interface SkillGroup {
  name: string;
  image?: boolean;
  description: string;
  tag?: string;
  tagHandler?: SkillHandler;
  skills: SkillCommand[];
}

export interface SkillCommand {
  command: string;
  handler?: SkillHandler;
  triggers: string[];
  adminOnly?: boolean;
  description: string;
  example?: string;
  params: Record<string, SkillParamConfig>;
}

export interface AbstractedMember {
  inboxId: string;
  address: string;
  accountAddresses: string[];
  installationIds?: string[];
}

export type MetadataValue = string | number | boolean;
export type Metadata = Record<string, MetadataValue | MetadataValue[]>;
