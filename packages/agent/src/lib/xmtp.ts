import dotenv from "dotenv";
dotenv.config();
import {
  DecodedMessage,
  Client as V3Client,
  ClientOptions,
  XmtpEnv,
  ContentTypeId,
  Conversation,
} from "@xmtp/node-sdk";
import {
  DecodedMessage as DecodedMessageV2,
  Client as V2Client,
  Conversation as V2Conversation,
} from "@xmtp/xmtp-js";
import { Reply, ReplyCodec } from "@xmtp/content-type-reply";
import { Reaction, ReactionCodec } from "@xmtp/content-type-reaction";
import { ContentTypeText, TextCodec } from "@xmtp/content-type-text";
import {
  Attachment,
  AttachmentCodec,
  RemoteAttachment,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import * as fs from "fs";
import { ReadReceipt, ReadReceiptCodec } from "@xmtp/content-type-read-receipt";
import {
  AgentMessage,
  AgentMessageCodec,
} from "../content-types/agent-message.js";
import { createWalletClient, http, toBytes, toHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { GrpcApiClient } from "@xmtp/grpc-api-client";
import { getRandomValues } from "crypto";
import path from "path";
import { xmtpConfig, XmtpClient } from "./types.js";

// Define the return type interface
interface UserReturnType {
  key: string;
  account: ReturnType<typeof privateKeyToAccount>;
  wallet: ReturnType<typeof createWalletClient>;
}
export class XMTP {
  private v2client: V2Client;
  private client: V3Client;
  private conversation: Conversation | V2Conversation | undefined;
  private message: DecodedMessage | DecodedMessageV2 | undefined;

  constructor(
    client: V3Client,
    v2client: V2Client,
    conversation: Conversation | V2Conversation | undefined,
    message: DecodedMessage | DecodedMessageV2 | undefined,
  ) {
    this.client = client;
    this.v2client = v2client;
    this.conversation = conversation;
    this.message = message;
  }
  async send(
    message:
      | string
      | Reply
      | Reaction
      | RemoteAttachment
      | Attachment
      | ReadReceipt
      | AgentMessage,
    contentType: ContentTypeId = ContentTypeText,
    conversation?: V2Conversation | Conversation,
  ) {
    if (conversation) {
      if (this.isV2Conversation(conversation)) {
        await (conversation as V2Conversation).send(message, {
          contentType: contentType as any,
        });
      } else if (this.isV3Conversation(conversation)) {
        await (conversation as Conversation).send(message, contentType as any);
      }
    }
  }
  isV2Message(message: DecodedMessage | DecodedMessageV2 | undefined) {
    return (message as DecodedMessageV2)?.conversation !== undefined;
  }

  isV2Conversation(
    conversation: Conversation | V2Conversation | undefined,
  ): conversation is V2Conversation {
    return (conversation as V2Conversation)?.topic !== undefined;
  }

  isV3Conversation(
    conversation: Conversation | V2Conversation | undefined,
  ): conversation is Conversation {
    return (conversation as Conversation)?.id !== undefined;
  }

  async createGroup(
    client: V3Client,
    senderAddress: string,
    clientAddress: string,
  ) {
    try {
      let senderInboxId = "";
      await client.conversations.sync();
      const group = await client?.conversations.newGroup([
        senderAddress,
        clientAddress,
      ]);
      console.log("Group created", group?.id);
      const members = await group.members();
      const senderMember = members.find((member) =>
        member.accountAddresses.includes(senderAddress.toLowerCase()),
      );
      if (senderMember) {
        senderInboxId = senderMember.inboxId;
        console.log("Sender's inboxId:", senderInboxId);
      } else {
        console.log("Sender not found in members list");
      }
      await group.addSuperAdmin(senderInboxId);
      console.log(
        "Sender is superAdmin",
        await group.isSuperAdmin(senderInboxId),
      );
      await group.send(`Welcome to the new group!`);
      await group.send(
        `You are now the admin of this group as well as the bot`,
      );
      return group;
    } catch (error) {
      console.log("Error creating group", error);
      return undefined;
    }
  }

  async removeFromGroup(
    groupId: string,
    client: V3Client,
    senderAddress: string,
  ): Promise<{ code: number; message: string }> {
    try {
      let lowerAddress = senderAddress.toLowerCase();
      const { v2, v3 } = await this.isOnXMTP(lowerAddress);
      console.warn("Checking if on XMTP: v2", v2, "v3", v3);
      if (!v3)
        return {
          code: 400,
          message: "You don't seem to have a v3 identity ",
        };
      const conversation =
        await client.conversations.getConversationById(groupId);
      console.warn("removing from group", conversation?.id);
      await conversation?.sync();
      await conversation?.removeMembers([lowerAddress]);
      console.warn("Removed member from group");
      await conversation?.sync();
      const members = await conversation?.members();
      console.warn("Number of members", members?.length);

      let wasRemoved = true;
      if (members) {
        for (const member of members) {
          let lowerMemberAddress = member.accountAddresses[0].toLowerCase();
          if (lowerMemberAddress === lowerAddress) {
            wasRemoved = false;
            break;
          }
        }
      }
      return {
        code: wasRemoved ? 200 : 400,
        message: wasRemoved
          ? "You have been removed from the group"
          : "Failed to remove from group",
      };
    } catch (error) {
      console.log("Error removing from group", error);
      return {
        code: 400,
        message: "Failed to remove from group",
      };
    }
  }

  async getV2ConversationBySender(sender: string) {
    try {
      if (!this.isV2Conversation(this.conversation)) {
        return this.conversation;
      }
      const conversations = await this.v2client.conversations.list();
      return conversations.find(
        (conv) => conv.peerAddress.toLowerCase() === sender.toLowerCase(),
      );
    } catch (error) {
      console.error("Error getting V2 conversation by sender:", error);
      return undefined;
    }
  }

  private async getV2MessageById(
    conversationId: string,
    reference: string,
  ): Promise<DecodedMessageV2 | undefined> {
    /*Takes to long, deprecated*/
    try {
      const conversations = await this.v2client.conversations.list();
      const conversation = conversations.find(
        (conv) => conv.topic === conversationId,
      );
      if (!conversation) return undefined;
      const messages = await conversation.messages();
      return messages.find((m) => m.id === reference) as DecodedMessageV2;
    } catch (error) {
      console.error("Error getting V2 message by id:", error);
      return undefined;
    }
  }

  getConversationKey() {
    const conversation = this.conversation;
    return `${(conversation as V2Conversation)?.topic || (conversation as Conversation)?.id}`;
  }

  getUserConversationKey() {
    const conversation = this.conversation;
    const awaitingSender =
      (this.message as DecodedMessage)?.senderInboxId ||
      (this.message as DecodedMessageV2)?.senderAddress;
    return `${(conversation as V2Conversation)?.topic || (conversation as Conversation)?.id}:${awaitingSender}`;
  }

  async getMessageById(reference: string) {
    return this.client.conversations?.getMessageById?.bind(
      this.client.conversations,
    )(reference);
  }

  async getLastMessageById(reference: string) {
    let isV2 = this.isV2Conversation(this.conversation);
    let msg = isV2
      ? this.getV2MessageById(
          (this.conversation as V2Conversation).topic,
          reference,
        )
      : this.getMessageById(reference);
    msg = (await msg)?.content;
    return msg;
  }

  async addToGroup(
    groupId: string,
    client: V3Client,
    address: string,
    asAdmin: boolean = false,
  ): Promise<{ code: number; message: string }> {
    try {
      let lowerAddress = address.toLowerCase();
      const { v2, v3 } = await this.isOnXMTP(lowerAddress);
      if (!v3)
        return {
          code: 400,
          message: "You don't seem to have a v3 identity ",
        };
      const group = await client.conversations.getConversationById(groupId);
      console.warn("Adding to group", group?.id);
      await group?.sync();
      await group?.addMembers([lowerAddress]);
      console.warn("Added member to group");
      await group?.sync();
      if (asAdmin) {
        await group?.addSuperAdmin(lowerAddress);
      }
      const members = await group?.members();
      console.warn("Number of members", members?.length);

      if (members) {
        for (const member of members) {
          let lowerMemberAddress = member.accountAddresses[0].toLowerCase();
          if (lowerMemberAddress === lowerAddress) {
            console.warn("Member exists", lowerMemberAddress);
            return {
              code: 200,
              message: "You have been added to the group",
            };
          }
        }
      }
      return {
        code: 400,
        message: "Failed to add to group",
      };
    } catch (error) {
      return {
        code: 400,
        message: "Failed to add to group",
      };
    }
  }
  async isOnXMTP(address: string): Promise<{ v2: boolean; v3: boolean }> {
    try {
      const [v2, v3] = await Promise.all([
        this.v2client ? this.v2client.canMessage(address) : false,
        this.client ? this.client.canMessage([address]) : false,
      ]);
      return {
        v2: v2 || false,
        v3: v3 ? (v3 as Map<string, boolean>).get(address) || false : false,
      };
    } catch (error) {
      console.error("Error checking XMTP availability:", error);
      return { v2: false, v3: false }; // Return default values on error
    }
  }
}

export async function createClient(
  onMessage: (
    message: DecodedMessage | DecodedMessageV2 | undefined,
  ) => Promise<void> = async () => {}, // Default to a no-op function
  config?: xmtpConfig,
): Promise<XmtpClient> {
  // Check if both clientConfig and privateKey are empty
  const testKey = await setupTestEncryptionKey();
  const { key, isRandom } = setupPrivateKey(config?.privateKey);
  const user = createUser(key);

  let env = process.env.XMTP_ENV as XmtpEnv;
  if (!env) env = "production" as XmtpEnv;

  let volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? "";
  volumePath += ".data/xmtp";

  if (fs && !fs.existsSync(volumePath)) {
    fs.mkdirSync(volumePath, { recursive: true });
  }

  const defaultConfig: ClientOptions = {
    env: env,
    dbPath: `${volumePath}/${user.account?.address.toLowerCase()}-${env}`,
    codecs: [
      new TextCodec(),
      new ReactionCodec(),
      new ReplyCodec(),
      new RemoteAttachmentCodec(),
      new AttachmentCodec(),
      new ReadReceiptCodec(),
      new AgentMessageCodec(),
    ],
  };

  // Merge the default configuration with the provided config. Repeated fields in clientConfig will override the default values
  const finalConfig = { ...defaultConfig, ...config?.client };
  //v2
  const account2 = privateKeyToAccount(key as `0x${string}`);
  const wallet2 = createWalletClient({
    account: account2,
    chain: mainnet,
    transport: http(),
  });
  const v2client = await V2Client.create(wallet2, {
    ...finalConfig,
    apiUrl: undefined,
    skipContactPublishing: false,
    apiClientFactory: GrpcApiClient.fromOptions as any,
  });
  const client = await V3Client.create(
    createSigner(user),
    testKey,
    finalConfig,
  );

  Promise.all([
    streamMessages(onMessage, v2client),
    streamMessages(onMessage, client),
  ]);

  return {
    client,
    address: client.accountAddress,
    inboxId: client.inboxId,
    v2client,
  } as XmtpClient;
}

async function streamMessages(
  onMessage: (
    message: DecodedMessage | DecodedMessageV2 | undefined,
  ) => Promise<void>,
  client: V3Client | V2Client,
) {
  let v3client = client instanceof V3Client ? client : undefined;
  let v2client = client instanceof V2Client ? client : undefined;

  // sync and list conversations
  if (v3client && typeof v3client.conversations.sync === "function") {
    await v3client.conversations.sync();
    await v3client.conversations.list();
  }

  while (true) {
    try {
      if (
        v3client &&
        typeof v3client.conversations.streamAllMessages === "function"
      ) {
        const stream = await v3client.conversations.streamAllMessages();
        console.warn(`\t- [v3] Stream started`);
        for await (const message of stream) {
          onMessage(message);
        }
      } else if (
        v2client &&
        typeof v2client.conversations.streamAllMessages === "function"
      ) {
        const stream = await v2client.conversations.streamAllMessages();
        console.warn(`\t- [v2] Stream started`);
        for await (const message of stream) {
          onMessage(message);
        }
      }
    } catch (err) {
      console.error(`[v3] Stream encountered an error:`, err);
    }
  }
}

function setupPrivateKey(customKey?: string): {
  key: string;
  isRandom: boolean;
} {
  const envFilePath = path.resolve(process.cwd(), ".env");
  let isRandom = false;

  // Handle private key setup
  let key = process?.env?.KEY || customKey;
  if (key && !key.startsWith("0x")) {
    key = "0x" + key;
  }

  // Generate new key if none exists or invalid
  if (!key || !checkPrivateKey(key)) {
    key = generatePrivateKey();
    isRandom = true;

    if (fs) {
      const envContent = `\nKEY=${key.substring(2)}\n`;
      if (fs.existsSync(envFilePath)) {
        fs.appendFileSync(envFilePath, envContent);
      } else {
        fs.writeFileSync(envFilePath, envContent);
      }
    }
  }

  return {
    key,
    isRandom,
  };
}

function createSigner(user: UserReturnType) {
  return {
    getAddress: () => user.account.address,
    signMessage: async (message: string) => {
      const signature = await user.wallet.signMessage({
        account: user.account,
        message,
      });
      return toBytes(signature);
    },
  };
}

async function setupTestEncryptionKey(): Promise<Uint8Array> {
  const envFilePath = path.resolve(process.cwd(), ".env");

  if (!process.env.TEST_ENCRYPTION_KEY) {
    // Only perform file operations in Node.js environment

    if (fs) {
      // Generate new test encryption key
      const testEncryptionKey = toHex(getRandomValues(new Uint8Array(32)));

      // Prepare the env content
      const envContent = `\nTEST_ENCRYPTION_KEY=${testEncryptionKey}\n`;

      if (fs) {
        if (fs.existsSync(envFilePath)) {
          fs.appendFileSync(envFilePath, envContent);
        } else {
          fs.writeFileSync(envFilePath, envContent);
        }
      }
    }
  }

  // Return as Uint8Array
  return new Uint8Array(
    toBytes(process.env.TEST_ENCRYPTION_KEY as `0x${string}`),
  );
}

function checkPrivateKey(key: string) {
  try {
    return privateKeyToAccount(key as `0x${string}`).address !== undefined;
  } catch (e) {
    return false;
  }
}

export function createUser(key: string): UserReturnType {
  const account = privateKeyToAccount(key as `0x${string}`);
  return {
    key,
    account,
    wallet: createWalletClient({
      account,
      chain: mainnet,
      transport: http(),
    }),
  };
}
