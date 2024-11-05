import { ReplyCodec } from "@xmtp/content-type-reply";
import { Client as V2Client } from "@xmtp/xmtp-js";

import { ReactionCodec } from "@xmtp/content-type-reaction";
import { Client, ClientOptions, XmtpEnv } from "@xmtp/node-sdk";
import { NapiSignatureRequestType } from "@xmtp/node-sdk";
import { logInitMessage } from "../helpers/utils";
import { TextCodec } from "@xmtp/content-type-text";
import {
  AttachmentCodec,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import * as fs from "fs";
import { createWalletClient, http, toBytes } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { GrpcApiClient } from "@xmtp/grpc-api-client";
import { Config } from "../helpers/types";

export default async function xmtpClient(
  config?: Config,
): Promise<{ client: Client; v2client: V2Client }> {
  // Check if both clientConfig and privateKey are empty
  let { key, isRandom } = getKey();
  let user = createUser(key);

  let env = process.env.XMTP_ENV as XmtpEnv;
  if (!env) {
    env = "production" as XmtpEnv;
  }

  if (!fs.existsSync(`.data`)) {
    fs.mkdirSync(`.data`);
  }

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

  const client = await Client.create(user.account.address, finalConfig);
  if (!config?.hideInitLogMessage)
    logInitMessage(client, config, key, isRandom);

  if (!client.isRegistered) {
    const signature = await getSignature(client, user);
    if (signature) {
      client.addSignature(1 as NapiSignatureRequestType, signature);
    }
    await client.registerIdentity();
  }
  return { client, v2client };
}

export const createUser = (key: string) => {
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

export type User = ReturnType<typeof createUser>;

export const getSignature = async (client: Client, user: User) => {
  const signatureText = await client.createInboxSignatureText();
  if (signatureText) {
    const signature = await user.wallet.signMessage({
      message: signatureText,
    });
    return toBytes(signature);
  }
  return null;
};

function getKey(customKey?: string): { key: string; isRandom: boolean } {
  let key = customKey ?? process?.env?.KEY;
  if (key !== undefined && !key.startsWith("0x")) key = "0x" + key;
  if (
    key == undefined ||
    typeof key !== "string" ||
    !/^0x[0-9a-fA-F]{64}$/.test(key) ||
    !checkPrivateKey(key)
  ) {
    key = generatePrivateKey();
    return { key, isRandom: true };
  } else return { key, isRandom: false };
}
function checkPrivateKey(key: string) {
  try {
    return privateKeyToAccount(key as `0x${string}`).address !== undefined;
  } catch (e) {
    return false;
  }
}
