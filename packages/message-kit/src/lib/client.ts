import { ReplyCodec } from "@xmtp/content-type-reply";
import { Client as V2Client } from "@xmtp/xmtp-js";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { Client, ClientOptions, XmtpEnv } from "@xmtp/node-sdk";
import { logInitMessage } from "../helpers/utils";
import { TextCodec } from "@xmtp/content-type-text";
import dotenv from "dotenv";
//import readline from "readline";
import {
  AttachmentCodec,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
// Only import fs in Node.js environment
//@ts-ignore
// Replace require with dynamic import for fs
import * as fsSync from "fs";
//@ts-ignore
const fs = typeof window === "undefined" ? fsSync : null;

import { createWalletClient, http, toBytes, toHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { GrpcApiClient } from "@xmtp/grpc-api-client";
import { RunConfig } from "../helpers/types";
import { getRandomValues } from "crypto";
import path from "path";

// Define the return type interface
interface UserReturnType {
  key: string;
  account: ReturnType<typeof privateKeyToAccount>;
  wallet: ReturnType<typeof createWalletClient>;
}

export type User = ReturnType<typeof createUser>;

export async function xmtpClient(
  runConfig?: RunConfig,
): Promise<{ client: Client; v2client: V2Client }> {
  // Check if both clientConfig and privateKey are empty
  const testKey = await setupTestEncryptionKey();
  const { key, isRandom } = setupPrivateKey(runConfig?.privateKey);
  const user = createUser(key);

  let env = process.env.XMTP_ENV as XmtpEnv;
  if (!env) env = "production" as XmtpEnv;

  const defaultConfig: ClientOptions = {
    env: env,
    dbPath: `.data/${user.account?.address}-${env}`,
    codecs: [
      new TextCodec(),
      new ReactionCodec(),
      new ReplyCodec(),
      new RemoteAttachmentCodec(),
      new AttachmentCodec(),
    ],
  };
  // Store the GPT model in process.env for global access
  process.env.GPT_MODEL = runConfig?.gptModel || "gpt-4o";

  // Merge the default configuration with the provided config. Repeated fields in clientConfig will override the default values
  const finalConfig = { ...defaultConfig, ...runConfig?.client };
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
  const client = await Client.create(createSigner(user), testKey, finalConfig);

  logInitMessage(client, runConfig, isRandom ? key : undefined);

  return { client, v2client };
}

export const createUser = (key: string): UserReturnType => {
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
};

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

    // Write new key to .env only if in Node.js environment
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

function checkPrivateKey(key: string) {
  try {
    return privateKeyToAccount(key as `0x${string}`).address !== undefined;
  } catch (e) {
    return false;
  }
}

export const createSigner = (user: User) => {
  // Only create directory in Node.js environment
  if (fs && !fs.existsSync(`.data`)) {
    fs.mkdirSync(`.data`);
  }

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
};

async function setupTestEncryptionKey(): Promise<Uint8Array> {
  const envFilePath = path.resolve(process.cwd(), ".env");

  if (!process.env.TEST_ENCRYPTION_KEY) {
    // Only perform file operations in Node.js environment
    if (fs) {
      if (fs.existsSync(`.data`)) {
        fs.rmSync(`.data`, { recursive: true });
      }

      // Generate new test encryption key
      const testEncryptionKey = toHex(getRandomValues(new Uint8Array(32)));

      // Prepare the env content
      const envContent = `\nTEST_ENCRYPTION_KEY=${testEncryptionKey}\n`;

      // Append or create .env file
      if (fs.existsSync(envFilePath)) {
        fs.appendFileSync(envFilePath, envContent);
      } else {
        fs.writeFileSync(envFilePath, envContent);
      }
      dotenv.config();
    }
  }

  // Return as Uint8Array
  return new Uint8Array(
    toBytes(process.env.TEST_ENCRYPTION_KEY as `0x${string}`),
  );
}
