import { Wallet } from "ethers";
import { ReactionCodec } from "../content-types/Reaction.js";
import { ReplyCodec } from "../content-types/Reply.js";
import { SilentCodec } from "../content-types/Silent.js";
import { BotMessageCodec } from "../content-types/BotMessage.js";
import { Client, ClientOptions, XmtpEnv } from "@xmtp/mls-client";
import { TextCodec } from "@xmtp/content-type-text";

export const mlsClient = async (
  clientConfig: ClientOptions = {},
  privateKey: string | null = null,
): Promise<Client> => {
  let key = privateKey ?? process.env.KEY;
  if (!key) {
    key = Wallet.createRandom().privateKey;
    console.error(
      "KEY not set. Using random one. For using your own wallet , set the KEY environment variable.",
    );
    console.log("Random private key: ", key);
  }
  const wallet = new Wallet(key);
  let env = process.env.XMTP_ENV as XmtpEnv;

  const defaultConfig: ClientOptions = {
    env: env,
    codecs: [
      new TextCodec(),
      new ReactionCodec(),
      new BotMessageCodec(),
      new ReplyCodec(),
      new SilentCodec(),
    ],
  };
  // Merge the default configuration with the provided config. Repeated fields in clientConfig will override the default values
  const finalConfig = { ...defaultConfig, ...clientConfig };
  const client = await Client.create(await wallet.getAddress(), finalConfig);
  console.log(`Listening on ${client.accountAddress}`);
  return client;
};
