import {
  Client as V2Client,
  DecodedMessage as V2DecodedMessage,
  Conversation as V2Conversation,
} from "@xmtp/xmtp-js";

import { ContentTypeText, TextCodec } from "@xmtp/content-type-text";
import { createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { Message, xmtpConfig, userMessage } from "../types";
import { parseMessage } from "./parse.js";
import {
  AgentMessage,
  ContentTypeAgentMessage,
} from "../content-types/agent-message.js";
import { Reaction } from "@xmtp/content-type-reaction";
import { ContentTypeReply, Reply } from "@xmtp/content-type-reply";
import {
  Attachment,
  ContentTypeRemoteAttachment,
} from "@xmtp/content-type-remote-attachment";
import { ContentTypeReadReceipt } from "@xmtp/content-type-read-receipt";
import { ContentTypeReaction } from "@xmtp/content-type-reaction";

export class XMTP {
  v2client: V2Client | undefined;
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
    const { key, isRandom } = await setupPrivateKey(this.config?.privateKey);
    const { Client } = await import("@xmtp/xmtp-js");
    const user = createUser(key);

    const defaultConfig = {
      codecs: [new TextCodec()],
      env: this.config?.env ?? "production",
    };
    const client = await Client.create(user.wallet, {
      ...defaultConfig,
      ...this.config,
    });

    this.v2client = client;
    this.address = client.address;
    this.inboxId = client.address;
    streamMessages(this.onMessage, client);

    return this;
  }

  async send(userMessage: userMessage): Promise<Message> {
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
      userMessage.receivers = [
        userMessage.originalMessage?.sender.address ?? "",
      ];
    }
    let messageSent: V2DecodedMessage | undefined | null = null;
    let conversation: V2Conversation | undefined | null = null;
    for (let receiver of userMessage?.receivers ?? []) {
      conversation = await this.getConversationByAddress(receiver);
      messageSent = (await conversation?.send(message, {
        contentType: contentType,
      })) as V2DecodedMessage;
    }
    const parsedMessage = await parseMessage(
      messageSent,
      conversation as V2Conversation,
      this.v2client as V2Client,
    );
    return parsedMessage as Message;
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
        return undefined;
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

  async getConversationByAddress(address: string) {
    try {
      const conversations = await this.v2client?.conversations.list();
      let found = conversations?.find(
        (conv: V2Conversation) =>
          conv.peerAddress.toLowerCase() === address.toLowerCase(),
      );
      if (!found) {
        found = await this.v2client?.conversations.newConversation(address);
      }
      return found;
    } catch (error) {
      console.error("Error getting conversation by address:", error);
      return undefined;
    }
  }

  async isOnXMTP(address: string): Promise<boolean> {
    try {
      return (await this.v2client?.canMessage(address)) ?? false;
    } catch (error) {
      console.error("Error checking XMTP availability:", error);
      return false;
    }
  }
}

export async function setupPrivateKey(
  customKey?: string,
): Promise<{ key: string; isRandom: boolean }> {
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
  }

  return {
    key,
    isRandom,
  };
}

async function streamMessages(
  onMessage: (message: Message | undefined) => Promise<void> | undefined,
  client: V2Client,
) {
  while (true) {
    try {
      const stream = await client.conversations.streamAllMessages();
      console.log(`Stream started`);
      for await (const message of stream) {
        if (message) {
          try {
            if (
              message.senderAddress?.toLowerCase() ===
              client.address.toLowerCase()
            ) {
              continue;
            }

            const parsedMessage = await parseMessage(
              message,
              message.conversation,
              client,
            );
            onMessage(parsedMessage);
          } catch (e) {
            console.log(`error`, e);
          }
        }
      }
    } catch (err) {
      console.error(`Stream encountered an error:`, err);
    }
  }
}

function checkPrivateKey(key: string) {
  try {
    return privateKeyToAccount(key as `0x${string}`).address !== undefined;
  } catch (e) {
    return false;
  }
}

function createUser(key: string) {
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
