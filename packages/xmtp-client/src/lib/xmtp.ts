import { Client } from "@xmtp/xmtp-js";
import { ContentTypeText, TextCodec } from "@xmtp/content-type-text";
import { createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { Message } from "./types.js";
import { parseMessage } from "./parse.js";

export class XMTPClass {
  client: Client;
  address: string;
  message: Message;

  constructor(client: Client) {
    this.client = client;
    this.address = client.address;
    this.message = {
      sender: {
        address: "",
        inboxId: "",
        installationIds: [],
        accountAddresses: [],
      },
      conversation: { id: "", topic: "", createdAt: new Date() },
      id: "",
      sent: new Date(),
      content: { text: "" },
      typeId: "text",
      version: "v2",
    };
  }

  async sendMessage(message: string, receiver?: string): Promise<Message> {
    const conversation = await this.getConversationByAddress(
      receiver ?? this.message.sender.address,
    );
    const toDecode = await conversation?.send(message, {
      contentType: ContentTypeText,
    });
    const parsedMessage = await parseMessage(toDecode);
    return parsedMessage as Message;
  }

  async getConversationByAddress(address: string) {
    try {
      const conversations = await this.client.conversations.list();
      let found = conversations.find(
        (conv) => conv.peerAddress.toLowerCase() === address.toLowerCase(),
      );
      if (!found) {
        found = await this.client.conversations.newConversation(address);
      }
      return found;
    } catch (error) {
      console.error("Error getting conversation by address:", error);
      return undefined;
    }
  }

  setMessage(message: Message) {
    this.message = message;
  }

  async isOnXMTP(address: string): Promise<boolean> {
    try {
      return await this.client.canMessage(address);
    } catch (error) {
      console.error("Error checking XMTP availability:", error);
      return false;
    }
  }
}

export async function XMTP(
  onMessage: (message: Message | undefined) => Promise<void> = async () => {},
  config?: { privateKey?: string; apiKey?: string },
): Promise<XMTPClass> {
  const { Client } = await import("@xmtp/xmtp-js");
  const { key } = setupPrivateKey(config?.privateKey);
  const user = createUser(key);

  const client = await Client.create(user.wallet, {
    codecs: [new TextCodec()],
    env: "production",
  });

  const xmtp = new XMTPClass(client);

  streamMessages(onMessage, client);

  return xmtp;
}

async function streamMessages(
  onMessage: (message: Message | undefined) => Promise<void>,
  client: Client,
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
            // You'll need to adapt parseMessage for the simplified version
            const parsedMessage = await parseMessage(message);
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

function setupPrivateKey(customKey?: string): { key: string } {
  let key = customKey;

  if (key && !key.startsWith("0x")) {
    key = "0x" + key;
  }

  if (!key || !checkPrivateKey(key)) {
    key = generatePrivateKey();
  }

  return { key };
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
