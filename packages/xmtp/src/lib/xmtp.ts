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
import { parseMessage } from "./parse.js";
import {
  Attachment,
  AttachmentCodec,
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import * as fs from "fs";
import {
  ContentTypeReadReceipt,
  ReadReceiptCodec,
} from "@xmtp/content-type-read-receipt";
import {
  AgentMessage,
  AgentMessageCodec,
  ContentTypeAgentMessage,
} from "../content-types/agent-message.js";
import { createWalletClient, http, toBytes, toHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { GrpcApiClient } from "@xmtp/grpc-api-client";
import { getRandomValues } from "crypto";
import path from "path";
import { xmtpConfig, Message, userMessage, UserReturnType } from "../types.js";
import { readFile } from "fs/promises";

export class XMTP {
  v2client: V2Client | undefined;
  client: V3Client | undefined;
  address: string | undefined;
  inboxId: string | undefined;
  onMessage: (message: Message | undefined) => Promise<void> | undefined;
  config?: xmtpConfig;

  constructor(
    onMessage?: (message: Message | undefined) => Promise<void> | undefined,
    config?: xmtpConfig,
  ) {
    this.onMessage = onMessage ?? (() => Promise.resolve());
    this.config = config;
  }

  async init(): Promise<XMTP> {
    const testKey = await setupTestEncryptionKey();
    const { key, isRandom } = setupPrivateKey(this.config?.privateKey);
    const user = createUser(key);

    let env = process.env.XMTP_ENV as XmtpEnv;
    if (!env) env = "production" as XmtpEnv;

    let volumePath =
      process.env.RAILWAY_VOLUME_MOUNT_PATH ??
      this.config?.path ??
      ".data/xmtp";

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
    const finalConfig = { ...defaultConfig, ...this.config };
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

    this.client = client;
    this.v2client = v2client;

    Promise.all([
      streamMessages(this.onMessage, client, this),
      streamMessages(this.onMessage, v2client, this),
    ]);
    return this;
  }

  async getAttachment(source: string): Promise<Attachment | undefined> {
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
          return undefined;
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

      const attachment: Attachment = {
        filename,
        mimeType,
        data: imgArray,
      };
      return attachment;
    } catch (error) {
      console.error("Failed to send image:", error);
      throw error;
    }
  }

  async send(userMessage: userMessage) {
    let contentType:
      | typeof ContentTypeReaction
      | typeof ContentTypeText
      | typeof ContentTypeRemoteAttachment
      | typeof ContentTypeAgentMessage
      | typeof ContentTypeReadReceipt
      | typeof ContentTypeReply = ContentTypeText;

    let message: any;
    if (!userMessage.typeId || userMessage.typeId === "text") {
      message = userMessage.message;
      contentType = ContentTypeText;
    } else if (userMessage.typeId === "attachment") {
      message = (await this.getAttachment(userMessage.message)) as Attachment;
      contentType = ContentTypeRemoteAttachment;
    } else if (userMessage.typeId === "reaction") {
      message = {
        content: userMessage.message,
        action: "added",
        reference: userMessage.originalMessage?.id,
        schema: "unicode",
      } as Reaction;
      contentType = ContentTypeReaction;
    } else if (userMessage.typeId === "reply") {
      contentType = ContentTypeReply;
      message = {
        content: userMessage.message,
        contentType: ContentTypeText,
        reference: userMessage.originalMessage?.id,
      } as Reply;
    } else if (userMessage.typeId === "agentMessage") {
      message = new AgentMessage(
        userMessage.message,
        userMessage.metadata,
      ) as AgentMessage;
      contentType = ContentTypeAgentMessage;
    }

    console.log(`message`, message);
    if (userMessage.originalMessage?.version == "v2") {
      let v2Conversation = await this.getV2ConversationByAddress(
        userMessage.originalMessage.client?.address,
      );

      if (!userMessage.receivers || userMessage.receivers.length == 0) {
        userMessage.receivers = [userMessage.originalMessage.sender.address];
      }
      for (let receiver of userMessage.receivers) {
        v2Conversation = await this.getV2ConversationByAddress(receiver);
        await v2Conversation?.send(message, {
          contentType: contentType,
        });
      }
    } else if (userMessage.originalMessage?.version == "v3") {
      let v3Conversation = await this.client?.conversations.getConversationById(
        userMessage.originalMessage?.conversation?.id,
      );
      if (!userMessage.receivers || userMessage.receivers.length == 0) {
        userMessage.receivers = [userMessage.originalMessage.sender.address];
      }
      for (let receiver of userMessage.receivers) {
        v3Conversation = await this.client?.conversations
          .list()
          .then(
            (conversations) =>
              conversations.find(
                (conv: V3Conversation) =>
                  conv.dmPeerInboxId.toLowerCase() === receiver.toLowerCase(),
              ) as V3Conversation,
          );
        await v3Conversation?.send(message, contentType);
      }
    }
  }

  async getConversationFromMessage(
    message: V3DecodedMessage | V2DecodedMessage | undefined,
  ): Promise<V3Conversation | V2Conversation | undefined> {
    return !this.isV2Message(message)
      ? ((await this.client?.conversations.getConversationById(
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

  async getV2ConversationByAddress(address: string) {
    try {
      const conversations = await this.v2client?.conversations.list();
      return conversations?.find(
        (conv) => conv.peerAddress.toLowerCase() === address.toLowerCase(),
      );
    } catch (error) {
      console.error("Error getting V2 conversation by sender:", error);
      return undefined;
    }
  }

  getConversationKey(message: Message) {
    return `${message?.conversation?.id}`;
  }

  getUserConversationKey(message: Message) {
    const awaitingSender =
      message?.version == "v2"
        ? message?.sender?.address
        : message?.sender?.inboxId;
    return `${message?.conversation?.id}:${awaitingSender}`;
  }

  async getMessageById(reference: string) {
    return this.client?.conversations?.getMessageById?.bind(
      this.client?.conversations,
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

async function streamMessages(
  onMessage: (message: Message | undefined) => Promise<void> | undefined,
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
        console.warn(`XMTP: [v3] Stream started`);
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
              console.log(`parsedMessage`, parsedMessage);
              await onMessage(parsedMessage as Message);
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
        console.warn(`XMTP: [v2] Stream started`);
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
              console.log(`parsedMessage`, parsedMessage);
              await onMessage(parsedMessage as Message);
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
