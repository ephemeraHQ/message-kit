import dotenv from "dotenv";
dotenv.config();
import {
  DecodedMessage as V3DecodedMessage,
  Client as V3Client,
  ClientOptions,
  XmtpEnv,
  Conversation as V3Conversation,
} from "@xmtp/node-sdk";
import {
  DecodedMessage as V2DecodedMessage,
  Client as V2Client,
  Conversation as V2Conversation,
} from "@xmtp/xmtp-js";
import { ContentTypeReply, Reply, ReplyCodec } from "@xmtp/content-type-reply";
import {
  ContentTypeReaction,
  Reaction,
  ReactionCodec,
} from "@xmtp/content-type-reaction";
import { ContentTypeText, TextCodec } from "@xmtp/content-type-text";
import { parseMessage, isV2Conversation } from "./parse.js";
import {
  Attachment,
  AttachmentCodec,
  ContentTypeRemoteAttachment,
  ContentTypeAttachment,
  RemoteAttachment,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import * as fs from "fs";
import { ReadReceipt, ReadReceiptCodec } from "@xmtp/content-type-read-receipt";
import {
  AgentMessage,
  AgentMessageCodec,
  ContentTypeAgentMessage,
} from "../content-types/agent-message.js";
import { ContentTypeId } from "@xmtp/content-type-primitives";
import { createWalletClient, http, toBytes, toHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { GrpcApiClient } from "@xmtp/grpc-api-client";
import { getRandomValues } from "crypto";
import path from "path";
import { xmtpConfig, Message } from "./types.js";
import { readFile } from "fs/promises";

interface UserReturnType {
  key: string;
  account: ReturnType<typeof privateKeyToAccount>;
  wallet: ReturnType<typeof createWalletClient>;
}
export class XMTP {
  v2client: V2Client;
  client: V3Client;
  address: string;
  inboxId: string;
  message: Message;

  constructor(client: V3Client, v2client: V2Client) {
    this.client = client;
    this.v2client = v2client;
    this.address = client.accountAddress;
    this.inboxId = client.inboxId;
    this.message = {} as Message;
  }
  async sendMessage(message: string, receiver?: string) {
    await this.send(message, ContentTypeText, receiver ?? undefined);
  }
  async sendAgentMessage(message: string, metadata: any) {
    let agentMessage = new AgentMessage(message, metadata);
    await this.send(agentMessage, ContentTypeAgentMessage);
  }
  async reply(message: string, replyTo: string) {
    const reply: Reply = {
      content: message,
      contentType: ContentTypeText,
      reference: replyTo,
    };
    await this.send(reply, ContentTypeReply);
  }

  async sendImage(source: string) {
    try {
      let imgArray: Uint8Array;
      let mimeType: string;
      let filename: string;

      const MAX_SIZE = 1024 * 1024; // 1MB in bytes

      // Check if source is a URL
      if (source.startsWith("http://") || source.startsWith("https://")) {
        try {
          // Handle URL
          const response = await fetch(source);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Check Content-Length header first if available
          const contentLength = response.headers.get("content-length");
          if (contentLength && parseInt(contentLength) > MAX_SIZE) {
            throw new Error("Image size exceeds 1MB limit");
          }

          const arrayBuffer = await response.arrayBuffer();

          // Double check actual size
          if (arrayBuffer.byteLength > MAX_SIZE) {
            throw new Error("Image size exceeds 1MB limit");
          }

          imgArray = new Uint8Array(arrayBuffer);
          mimeType = response.headers.get("content-type") || "image/jpeg";
          filename = source.split("/").pop() || "image";

          // If filename doesn't have an extension, add one based on mime type
          if (!filename.includes(".")) {
            const ext = mimeType.split("/")[1];
            filename = `${filename}.${ext}`;
          }
        } catch (error) {
          console.error("Error fetching image from URL:", error);
          throw error;
        }
      } else {
        // Handle file path
        const file = await readFile(source);
        if (!file) {
          console.error("File operations not supported in this environment");
          return;
        }

        // Check file size
        if (file.length > MAX_SIZE) {
          throw new Error("Image size exceeds 1MB limit");
        }

        filename = path.basename(source);
        const extname = path.extname(source);
        mimeType = `image/${extname.replace(".", "").replace("jpg", "jpeg")}`;
        imgArray = new Uint8Array(file);
      }

      const attachment = {
        filename,
        mimeType,
        data: imgArray,
      };

      await this.send(attachment, ContentTypeRemoteAttachment);
    } catch (error) {
      console.error("Failed to send image:", error);
      throw error;
    }
  }
  async react(emoji: string, reference: string) {
    let reaction: Reaction = {
      content: emoji,
      action: "added",
      reference: reference,
      schema: "unicode",
    };
    await this.send(reaction, ContentTypeReaction);
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
    contentType: ContentTypeId,
    receiver?: string,
  ) {
    if (this.message.version == "v2") {
      let v2Conversation = await this.getV2ConversationByAddress(
        receiver ?? this.message.sender.address,
      );
      await v2Conversation?.send(message, {
        contentType: contentType,
      });
    } else if (this.message.version == "v3") {
      let v3Conversation = await this.client.conversations.getConversationById(
        this.message.conversation.id,
      );
      if (receiver) {
        v3Conversation = await this.client.conversations
          .list()
          .then(
            (conversations) =>
              conversations.find(
                (conv: V3Conversation) =>
                  conv.dmPeerInboxId.toLowerCase() === receiver.toLowerCase(),
              ) as V3Conversation,
          );
      }
      await v3Conversation?.send(message, contentType);
    }
  }

  async getConversationFromMessage(
    message: V3DecodedMessage | V2DecodedMessage | undefined,
  ): Promise<V3Conversation | V2Conversation | undefined> {
    return !this.isV2Message(message)
      ? ((await this.client.conversations.getConversationById(
          (message as V3DecodedMessage)?.conversationId as string,
        )) as V3Conversation)
      : ((message as V2DecodedMessage)?.conversation as V2Conversation);
  }

  isV2Message(message: V3DecodedMessage | V2DecodedMessage | undefined) {
    return (message as V2DecodedMessage)?.conversation !== undefined;
  }

  isV3Conversation(
    conversation: V3Conversation | V2Conversation | undefined,
  ): conversation is V3Conversation {
    return (conversation as V3Conversation)?.id !== undefined;
  }
  setMessage(message: Message) {
    this.message = message;
  }
  async getV2ConversationByAddress(address: string) {
    try {
      const conversations = await this.v2client.conversations.list();
      return conversations.find(
        (conv) => conv.peerAddress.toLowerCase() === address.toLowerCase(),
      );
    } catch (error) {
      console.error("Error getting V2 conversation by sender:", error);
      return undefined;
    }
  }

  getConversationKey() {
    return `${this.message.conversation.id}`;
  }

  getUserConversationKey() {
    const awaitingSender =
      this.message.version == "v2"
        ? this.message.sender.address
        : this.message.sender.inboxId;
    return `${this.message.conversation.id}:${awaitingSender}`;
  }

  async getMessageById(reference: string) {
    return this.client.conversations?.getMessageById?.bind(
      this.client.conversations,
    )(reference);
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
  onMessage: (message: Message | undefined) => Promise<void> = async () => {}, // Default to a no-op function
  config?: xmtpConfig,
): Promise<XMTP> {
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

  const xmtpInstance = new XMTP(client, v2client);

  Promise.all([
    streamMessages(onMessage, v2client, xmtpInstance),
    streamMessages(onMessage, client, xmtpInstance),
  ]);

  return xmtpInstance as XMTP;
}

async function streamMessages(
  onMessage: (message: Message | undefined) => Promise<void>,
  client: V3Client | V2Client,
  xmtp: XMTP,
) {
  let v3client = client instanceof V3Client ? client : undefined;
  let v2client = client instanceof V2Client ? client : undefined;

  while (true) {
    try {
      if (
        v3client &&
        typeof v3client.conversations.streamAllMessages === "function"
      ) {
        await v3client.conversations.sync();
        await v3client.conversations.list();
        const stream = await v3client.conversations.streamAllMessages();
        console.warn(`\t- [v3] Stream started`);
        for await (const message of stream) {
          let conversation = await xmtp.getConversationFromMessage(message);
          if (message && conversation) {
            try {
              const { senderInboxId, kind } = message as V3DecodedMessage;
              if (
                // Filter out membership_change messages
                senderInboxId?.toLowerCase() ===
                  v3client.inboxId.toLowerCase() &&
                kind !== "membership_change"
              ) {
                continue;
              }
              const parsedMessage = await parseMessage(
                message,
                conversation,
                client,
              );
              onMessage(parsedMessage);
            } catch (e) {
              console.log(`error`, e);
            }
          }
        }
      } else if (
        v2client &&
        typeof v2client.conversations.streamAllMessages === "function"
      ) {
        const stream = await v2client.conversations.streamAllMessages();
        console.warn(`\t- [v2] Stream started`);
        for await (const message of stream) {
          let conversation = await xmtp.getConversationFromMessage(message);
          if (message && conversation) {
            try {
              const senderAddress = (message as V2DecodedMessage).senderAddress;
              if (
                //If same address do nothin
                senderAddress?.toLowerCase() === v2client?.address.toLowerCase()
              ) {
                continue;
              }

              const parsedMessage = await parseMessage(
                message,
                conversation,
                client,
              );
              onMessage(parsedMessage);
            } catch (e) {
              console.log(`error`, e);
            }
          }
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
