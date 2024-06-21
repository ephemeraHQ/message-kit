import { Client as XmtpClient, XmtpEnv } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import { GrpcApiClient } from "@xmtp/grpc-api-client";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { ReplyCodec } from "@xmtp/content-type-reply";

export default async function xmtpClient(
  appConfig = {},
  privateKey: string | null = null,
): Promise<XmtpClient> {
  let key = privateKey ?? process.env.KEY;
  if (!key) {
    key = await Wallet.createRandom().privateKey;
    console.error(
      "KEY not set. Using random one. For using your own wallet , set the KEY environment variable.",
    );
    console.log("Random private key: ", key);
  }
  const wallet = new Wallet(key);
  let env = process.env.XMTP_ENV;
  if (process.env.XMTP_ENV !== "production" && process.env.XMTP_ENV !== "dev") {
    console.error("XMTP_ENV must be set to 'production' or 'dev'"); // log in colors in terminal
    env = "production";
  }

  const defaultConfig = {
    env: env as XmtpEnv,
    apiClientFactory: GrpcApiClient.fromOptions as any,
  };
  // Merge the default configuration with the provided config. Repeated fields in appConfig will override the default values
  const finalConfig = { ...defaultConfig, ...appConfig };
  const client = await XmtpClient.create(wallet, finalConfig);
  console.log(`Listening on ${client.address}`);
  return client;
}
