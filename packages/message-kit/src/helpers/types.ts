import { Context } from "../lib/core.js";
import { xmtpConfig } from "xmtp";

export type SkillResponse = {
  code: number;
  message: string;
  data?: any;
};

export type AgentWalletData = {
  id: string;
  wallet: any;
  address: string;
  agent_address: string;
  blockchain?: string;
  state?: string;
  key: string;
};

export interface AgentWallet {
  getWallet: (
    key: string,
    createIfNotFound?: boolean,
  ) => Promise<AgentWalletData | undefined>;
  transfer: (
    fromAddress: string,
    toAddress: string,
    amount: number,
  ) => Promise<any>;
  checkBalance: (
    key: string,
  ) => Promise<{ address: string | undefined; balance: number }>;
  createWallet: (key: string) => Promise<AgentWalletData>;
  onRampURL: (amount: number, address: string) => Promise<string | undefined>;
}
export type AgentConfig = {
  // client options from XMTP client
  client?: xmtpConfig;
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
  optional?: boolean;
}

export interface Vibe {
  vibe: string;
  description: string;
  tone: string;
  style: string;
  quirks?: string[];
}
export type SkillHandler = (context: Context) => Promise<SkillResponse | void>;

export type Handler = (context: Context) => Promise<void>;

export interface Agent {
  name: string;
  description: string;
  intro?: string;
  tag: string;
  systemPrompt?: string;
  skills?: Skill[][];
  vibe?: Vibe;
  onMessage?: Handler;
  config?: AgentConfig;
}
export interface Skill {
  skill: string;
  handler?: SkillHandler;
  adminOnly?: boolean;
  description: string;
  examples: string[];
  params?: Record<string, SkillParamConfig>;
}

export type MetadataValue = string | number | boolean;
export type Metadata = Record<string, MetadataValue | MetadataValue[]>;
