import { privateKeyToAccount } from "viem/accounts";
import { ContentTypeId } from "@xmtp/content-type-primitives";
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
  id: string; // Unique identifier for the message
  sent: Date; // Date when the message was sent
  content: {
    text?: string | undefined; // Text content of the message
    reply?: string | undefined; // Reply content if the message is a reply
    previousMsg?: string | undefined; // Reference to the previous message
    attachment?: string | undefined; // Attachment content if the message is an attachment
    react?: string | undefined; // Reaction content if the message is a reaction
    content?: any | undefined; // Any other content
    metadata?: any | undefined; // Metadata for the message
    remoteAttachment?: any | undefined; // Remote attachment content if the message is a remote attachment
    readReceipt?: any | undefined; // Read receipt content if the message is a read receipt
    agentMessage?: any | undefined; // Agent message content if the message is an agent message
    reaction?: any | undefined; // Reaction content if the message is a reaction
    params?: any | undefined; // Parameters for the message
    reference?: string | undefined; // Reference ID for the message
    skill?: string | undefined; // Skill associated with the message
    any?: any; // Any other content
  };
  version: "v2" | "v3";
  group?: Conversation | undefined; // Group the message belongs to
  conversation: Conversation; // Conversation the message belongs to
  sender: User; // Sender of the message
  typeId: string; // Type identifier for the message
};

export interface User {
  address: string;
  inboxId: string;
  installationIds: string[];
  accountAddresses: string[];
  username?: string;
  ensDomain?: string;
}