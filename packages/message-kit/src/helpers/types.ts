import { XMTPContext } from "../lib/xmtp.js";
import { ClientOptions, GroupMember } from "@xmtp/node-sdk";
import { ContentTypeId } from "@xmtp/content-type-primitives";
import type { RedisClientType } from "@redis/client";

export type MessageAbstracted = {
  id: string;
  sent: Date;
  content: {
    text?: string | undefined;
    reply?: string | undefined;
    previousMsg?: string | undefined;
    react?: string | undefined;
    content?: any | undefined;
    params?: any | undefined;
    reference?: string | undefined;
    skill?: string | undefined;
  };
  version: "v2" | "v3";
  sender: AbstractedMember;
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
  admins: string[];
  superAdmins: string[];
  createdAt: Date;
  members: GroupMember[];
};
export type SkillResponse = {
  code: number;
  message: string;
  data?: any;
};

export type SkillHandler = (
  context: XMTPContext,
) => Promise<SkillResponse | void>;

export type Handler = (context: XMTPContext) => Promise<void>;

export type RunConfig = {
  // client options from XMTP client
  client?: ClientOptions;
  // private key to be used for the client, if not, default from env
  privateKey?: string;
  // if true, the init log message with messagekit logo and stuff will be hidden
  experimental?: boolean;
  // hide the init log message with messagekit logo and stuff
  hideInitLogMessage?: boolean;
  // agent wallet
  walletService?: boolean;
  // if true, attachments will be enabled
  attachments?: boolean;
  // if true, member changes will be enabled, like adding members to the group
  memberChange?: boolean;
  // skills to be used
  agent?: Agent;
  // model to be used
  gptModel?: string;
  // wallet service db
  walletServiceDB?: RedisClientType;
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

export interface Frame {
  title: string;
  buttons: { content: string; action: string; target: string }[];
  image: string;
}
export interface Agent {
  name: string;
  description: string;
  tag: string;
  skills: Skill[];
}
export interface Skill {
  skill: string;
  handler?: SkillHandler | undefined;
  adminOnly?: boolean;
  description: string;
  examples: string[];
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
