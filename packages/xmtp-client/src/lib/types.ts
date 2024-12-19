import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient } from "viem";
import { ClientOptions } from "@xmtp/node-sdk";

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

export type Conversation = {
  id: string;
  createdAt: Date;
  topic?: string;
  members?: User[];
  admins?: string[];
  name?: string;
  superAdmins?: string[];
};

export type Message = {
  id: string;
  sender: User;
  conversation: {
    id: string;
    topic: string;
    createdAt: Date;
  };
  group?: undefined;
  sent: Date;
  content: { text: string };
  typeId: string;
  version: "v2";
};

export interface User {
  address: string;
  inboxId: string;
  installationIds: string[];
  accountAddresses: string[];
}
