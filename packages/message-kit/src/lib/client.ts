import { ReplyCodec } from "@xmtp/content-type-reply";
import { Client as V2Client } from "@xmtp/xmtp-js";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { Client, ClientOptions, XmtpEnv } from "@xmtp/node-sdk";
import { Wallet } from "ethers";
import * as path from "path";

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

export default async function xmtpClient(
  clientConfig: ClientOptions = {},
  privateKey: string | null = null,
): Promise<{ client: Client; v2client: V2Client }> {
  let key = privateKey ?? process.env.KEY;
  if (!isHex(key)) {
    key = generatePrivateKey();
    console.error(".env KEY not set. Using random one:\n", key);
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

  if (!fs.existsSync(`.cache`)) {
    fs.mkdirSync(`.cache`);
  }

  const defaultConfig: ClientOptions = {
    env: env,
    dbPath: `.cache/${wallet.account?.address}-${env}`,
    codecs: [
      new TextCodec(),
      new ReactionCodec(),
      new ReplyCodec(),
      new RemoteAttachmentCodec(),
      new AttachmentCodec(),
    ],
  };
  // Merge the default configuration with the provided config. Repeated fields in clientConfig will override the default values
  const finalConfig = { ...defaultConfig, ...clientConfig };
  const client = await Client.create(account.address, finalConfig);
  //v2
  const wallet2 = new Wallet(key);
  const v2client = await V2Client.create(wallet2, {
    ...finalConfig,
    apiUrl: undefined,
    skipContactPublishing: false,
    apiClientFactory: GrpcApiClient.fromOptions as any,
  });

  console.log("Listening on client: ", {
    accountAddress: client.accountAddress,
    inboxId: client.inboxId,
    installationId: client.installationId,
  });

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

  //commands
  // check if file exists
  const resolvedPath = path.resolve(process.cwd(), "src/" + "commands.ts");
  if (!fs.existsSync(resolvedPath)) {
    console.error(`No commands.ts file found`);
  }

  return { client, v2client };
}
