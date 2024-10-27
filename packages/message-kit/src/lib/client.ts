import { ReplyCodec } from "@xmtp/content-type-reply";
import { Client as V2Client } from "@xmtp/xmtp-js";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { Client, ClientOptions, XmtpEnv } from "@xmtp/node-sdk";
import { Wallet } from "ethers";
import { logInitMessage } from "../helpers/utils";
import { TextCodec } from "@xmtp/content-type-text";
import {
  AttachmentCodec,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import * as fs from "fs";
import { createWalletClient, http, toBytes, isHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { GrpcApiClient } from "@xmtp/grpc-api-client";
import { Config } from "../helpers/types";

export default async function xmtpClient(
  config?: Config,
): Promise<{ client: Client; v2client: V2Client }> {
  // Check if both clientConfig and privateKey are empty
  let key = config?.privateKey ?? process.env.KEY;
  if (key !== undefined && !key.startsWith("0x")) key = "0x" + key;
  if (key === undefined) {
    console.warn("⚠️🔒 .env KEY not set. Generating a random one:");
    key = generatePrivateKey();
    console.warn(key + "\nCopy and paste it in your .env file as KEY=YOUR_KEY");
  } else if (!isHex(key)) {
    console.warn("⚠️🔒 Invalid private key. Generating a random one:");
    key = generatePrivateKey();
    console.info(key + "\nCopy and paste it in your .env file as KEY=YOUR_KEY");
  }
  const account = privateKeyToAccount(key as `0x${string}`);
  const wallet = createWalletClient({
    account,
    chain: mainnet,
    transport: http(),
  });

  let env = process.env.XMTP_ENV as XmtpEnv;
  if (!env) {
    env = "production" as XmtpEnv;
  }

  if (!fs.existsSync(`.data`)) {
    fs.mkdirSync(`.data`);
  }

  const defaultConfig: ClientOptions = {
    env: env,
    dbPath: `.data/${wallet.account?.address}-${env}`,
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
  const client = await Client.create(account.address, finalConfig);
  //v2
  const wallet2 = new Wallet(key as `0x${string}`);
  const v2client = await V2Client.create(wallet2, {
    ...finalConfig,
    apiUrl: undefined,
    skipContactPublishing: false,
    apiClientFactory: GrpcApiClient.fromOptions as any,
  });

  if (!config?.hideLog) logInitMessage(client, config);

  // register identity
  if (!client.isRegistered && client.signatureText) {
    const signatureText = await client.signatureText();
    if (signatureText) {
      const signature = await wallet.signMessage({
        message: signatureText,
      });
      const signatureBytes = toBytes(signature);
      if (signatureBytes) {
        client.addSignature(signatureBytes);
      }
    }

    await client.registerIdentity();
  }

  return { client, v2client };
}
