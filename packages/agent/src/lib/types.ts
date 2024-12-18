import { privateKeyToAccount } from "viem/accounts";
import { ContentTypeId } from "@xmtp/content-type-primitives";
import { createWalletClient } from "viem";
import { ClientOptions } from "@xmtp/node-sdk";
import { Client as V3Client } from "@xmtp/node-sdk";
import { Client as V2Client } from "@xmtp/xmtp-js";

export interface XmtpClient {
  inboxId: string;
  address: string;
  client: V3Client;
  v2client: V2Client;
}
export { Client as V3Client } from "@xmtp/node-sdk";
export { Client as V2Client } from "@xmtp/xmtp-js";

export interface UserReturnType {
  key: string;
  account: ReturnType<typeof privateKeyToAccount>;
  wallet: ReturnType<typeof createWalletClient>;
}
export type xmtpConfig = {
  privateKey?: string;
  client?: any;
  gptModel?: string;
} & ClientOptions;

export type Message = {
  id: string; // Unique identifier for the message
  sent: Date; // Date when the message was sent
  content: {
    text?: string | undefined; // Text content of the message
    reply?: string | undefined; // Reply content if the message is a reply
    previousMsg?: string | undefined; // Reference to the previous message
    react?: string | undefined; // Reaction content if the message is a reaction
    content?: any | undefined; // Any other content
    params?: any | undefined; // Parameters for the message
    reference?: string | undefined; // Reference ID for the message
    skill?: string | undefined; // Skill associated with the message
  };
  sender: User; // Sender of the message
  typeId: string; // Type identifier for the message
};
export type Group = {
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
  members: User[];
};

export interface User {
  inboxId: string;
  address: string;
  accountAddresses: string[];
  installationIds?: string[];
  username?: string;
  ensDomain?: string;
}
