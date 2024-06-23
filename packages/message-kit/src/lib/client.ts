import { ReplyCodec } from "@xmtp/content-type-reply";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { SilentCodec } from "../content-types/Silent.js";
import { BotMessageCodec } from "../content-types/BotMessage.js";
import { Client, ClientOptions, XmtpEnv } from "@xmtp/mls-client";
import { TextCodec } from "@xmtp/content-type-text";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import * as fs from "fs";
import { createWalletClient, http, toBytes } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

export default async function xmtpClient(
  clientConfig: ClientOptions = {},
  privateKey: string | null = null,
): Promise<Client> {
  let key = privateKey ?? process.env.KEY;
  if (!key) {
    key = generatePrivateKey();
    console.error(
      "KEY not set. Using random one. For using your own wallet , set the KEY environment variable.",
    );
    console.log("Random private key: ", key);
  }

  const account = privateKeyToAccount(key as `0x${string}`);
  const wallet = createWalletClient({
    account,
    chain: mainnet,
    transport: http(),
  });

  let env = process.env.XMTP_ENV as XmtpEnv;

  if (!fs.existsSync(`.cache`)) {
    fs.mkdirSync(`.cache`);
  }

  const defaultConfig: ClientOptions = {
    env: env,
    dbPath: `.cache/${wallet.account?.address}-${process.env.XMTP_ENV}`,
    codecs: [
      new TextCodec(),
      new ReactionCodec(),
      new BotMessageCodec(),
      new ReplyCodec(),
      new SilentCodec(),
      new RemoteAttachmentCodec(),
    ],
  };
  // Merge the default configuration with the provided config. Repeated fields in clientConfig will override the default values
  const finalConfig = { ...defaultConfig, ...clientConfig };
  const client = await Client.create(account.address, finalConfig);

  // register identity
  if (!client.isRegistered && client.signatureText) {
    console.log("Registering identity");
    const signature = await wallet.signMessage({
      message: client.signatureText,
    });
    const signatureBytes = toBytes(signature);
    client.addEcdsaSignature(signatureBytes);
    await client.registerIdentity();
  }

  console.log(`Listening on ${client.accountAddress}`);
  return client;
}
