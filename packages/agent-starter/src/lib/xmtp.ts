import dotenv from "dotenv";
dotenv.config();
import {
  DecodedMessage,
  Client,
  ClientOptions,
  XmtpEnv,
  Conversation,
} from "@xmtp/node-sdk";
import { ContentTypeReply, Reply, ReplyCodec } from "@xmtp/content-type-reply";
import {
  ContentTypeReaction,
  Reaction,
  ReactionCodec,
} from "@xmtp/content-type-reaction";
import { ContentTypeText, TextCodec } from "@xmtp/content-type-text";
import {
  Attachment,
  AttachmentCodec,
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import {
  ContentTypeReadReceipt,
  ReadReceiptCodec,
} from "@xmtp/content-type-read-receipt";
import {
  AgentMessage,
  AgentMessageCodec,
  ContentTypeAgentMessage,
} from "../content-types/agent-message.js";
import { createWalletClient, http, isAddress, toBytes, toHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

import { getRandomValues } from "crypto";
import path from "path";
import { Message, userMessage, UserReturnType, User, Agent } from "./types.js";
import { readFile } from "fs/promises";
import * as fs from "fs";
import {
  getEvmAddressFromDns,
  getEvmAddressFromHeaderTag,
  getUserInfo,
} from "./resolver.js";
import fetch from "node-fetch";

export async function createAgent(agent: Agent): Promise<XMTP> {
  let xmtp: XMTP | null = null; // Ensure a single instance
  xmtp = new XMTP(agent);
  await xmtp.init();
  return xmtp;
}

export class XMTP {
  client: Client | undefined;
  address: string | undefined;
  inboxId: string | undefined;
  onMessage: (message: Message) => Promise<void>;
  agent?: Agent;

  constructor(agent?: Agent) {
    this.onMessage = agent?.onMessage ?? (() => Promise.resolve());
    this.agent = agent;
  }

  async init(): Promise<XMTP> {
    const testKey = await setupTestEncryptionKey();
    const { key, isRandom } = setupPrivateKey(this.agent?.encryptionKey);
    const user = createUser(key);

    let env = process.env.XMTP_ENV as XmtpEnv;
    if (!env) env = "production" as XmtpEnv;

    let volumePath =
      process.env.RAILWAY_VOLUME_MOUNT_PATH ??
      this.agent?.config?.path ??
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
    const finalConfig = { ...defaultConfig, ...this.agent?.config };

    const client = await Client.create(
      createSigner(user),
      testKey,
      finalConfig,
    );

    this.client = client;

    this.inboxId = client.inboxId;
    this.address = client.accountAddress;
    Promise.all([streamMessages(this.onMessage, client, this)]);
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
    if (!userMessage.receivers || userMessage.receivers.length == 0) {
      userMessage.receivers = [userMessage.originalMessage?.sender.inboxId];
    }
    for (let receiver of userMessage.receivers) {
      let resolvedAddress = receiver;

      // Check if receiver is a website
      if (receiver.startsWith("http://") || receiver.startsWith("https://")) {
        resolvedAddress =
          (await getEvmAddressFromDns(receiver)) ||
          (await getEvmAddressFromHeaderTag(receiver)) ||
          receiver;
      }
      // Check if receiver is an ENS domain
      else if (receiver.endsWith(".eth")) {
        resolvedAddress = (await getUserInfo(receiver))?.address || receiver;
      } else if (isAddress(receiver)) {
        resolvedAddress =
          (await this.client?.getInboxIdByAddress(receiver)) || receiver;
      }

      let conversation = await this.client?.conversations
        .list()
        .find(
          (conv: Conversation) =>
            conv.dmPeerInboxId?.toLowerCase() === resolvedAddress.toLowerCase(),
        );
      return conversation?.send(message, contentType);
    }
  }

  async getConversationFromMessage(
    message: DecodedMessage | null | undefined,
  ): Promise<Conversation | null | undefined> {
    return await this.client?.conversations.getConversationById(
      (message as DecodedMessage)?.conversationId as string,
    );
  }

  isConversation(conversation: Conversation): conversation is Conversation {
    return conversation?.id !== undefined;
  }

  getConversationKey(message: Message) {
    return `${message?.group?.id}`;
  }
  async encryptMessage(message: Message): Promise<Message | undefined> {
    return message;
  }
  async decryptMessage(messageId: string): Promise<Message | undefined> {
    try {
      // Fetch the message by ID
      const message = await this.getMessageById(messageId);
      if (!message) {
        console.error(`Message with ID ${messageId} not found.`);
        return undefined;
      }
      return parseMessage(message, undefined, this.client as Client);
    } catch (error) {
      console.error(
        `Error fetching or decrypting message with ID ${messageId}:`,
        error,
      );
      return undefined;
    }
  }

  getUserConversationKey(message: Message) {
    return `${message?.group?.id}`;
  }

  async getMessageById(reference: string) {
    return this.client?.conversations?.getMessageById?.bind(
      this.client?.conversations,
    )(reference);
  }

  async canMessage(address: string): Promise<boolean> {
    const isOnXMTP = await this.client?.canMessage([address]);
    return isOnXMTP ? true : false;
  }
}
async function streamMessages(
  onMessage: (message: Message) => Promise<void>,
  client: Client | undefined,
  xmtp: XMTP,
) {
  while (true) {
    try {
      await client?.conversations.sync();
      await client?.conversations.list();
      const stream = await client?.conversations.streamAllMessages();
      if (stream) {
        if (xmtp.agent?.config?.hideInitLogMessage !== true) {
          console.log(`XMTP agent initialized on ${xmtp?.address}`);
          console.log(
            `Send a message on:\n\t- https://xmtp.chat\n\t- https://converse.xyz/dm/${xmtp?.address}`,
          );
          console.log(
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Logging new messages to console ↴`,
          );
        }
        for await (const message of stream) {
          let conversation = await xmtp.getConversationFromMessage(message);
          if (message && conversation) {
            try {
              const { senderInboxId, kind } = message as DecodedMessage;

              if (
                // Filter out membership_change messages and sent by one
                senderInboxId?.toLowerCase() ===
                  client?.inboxId.toLowerCase() &&
                kind !== "membership_change"
              ) {
                continue;
              }
              const parsedMessage = await parseMessage(
                message,
                conversation,
                client as Client,
              );
              await onMessage(parsedMessage as Message);
            } catch (e) {
              console.log(`error`, e);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Stream encountered an error:`, err);
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

export async function parseMessage(
  message: DecodedMessage | undefined | null,
  conversation: Conversation | undefined,
  client: Client,
): Promise<Message | undefined> {
  if (message == null) return undefined;
  let typeId = message.contentType?.typeId ?? "text";
  let content = message.content;
  if (typeId == "text") {
    content = {
      text: content,
    };
  } else if (typeId == "reply") {
    let previousMsg = await client.conversations.getMessageById(
      message.content?.reference as string,
    );
    content = {
      previousMsg: previousMsg,
      reply: content.content,
      text: content.content,
      reference: content.reference,
    };
  } else if (typeId == "reaction") {
    content = {
      reaction: content.content,
      reference: content.reference,
    };
  } else if (message.contentType?.typeId == "remote_attachment") {
    const attachment = await RemoteAttachmentCodec.load(
      message.content,
      client,
    );
    content = {
      attachment: attachment as string,
    };
  } else if (typeId == "read_receipt") {
    //Log read receipt
  } else if (typeId == "agent") {
    content = {
      text: message.content.text,
      metadata: message.content.metadata,
    };
  } else if (typeId == "attachment") {
    const blobdecoded = new Blob([message.content.data], {
      type: message.content.mimeType,
    });
    const url = URL.createObjectURL(blobdecoded);

    content = {
      attachment: url,
    };
  }
  let date = message.sentAt;
  let sender: User | undefined = undefined;

  await conversation?.sync();
  const members = await conversation?.members();
  let membersArray = members?.map((member: any) => ({
    inboxId: member.inboxId,
    address: member.accountAddresses[0],
    accountAddresses: member.accountAddresses,
    installationIds: member.installationIds,
  })) as User[];

  sender = membersArray?.find(
    (member: User) =>
      member.inboxId === (message as DecodedMessage).senderInboxId,
  );
  return {
    id: message.id,
    sender,
    group: {
      id: conversation?.id,
      createdAt: conversation?.createdAt,
      name: conversation?.name,
      members: membersArray,
      admins: conversation?.admins,
      superAdmins: conversation?.superAdmins,
    },
    sent: date as Date,
    content,
    typeId,
    client: {
      address: client.accountAddress,
      inboxId: client.inboxId,
    },
  } as Message;
}
