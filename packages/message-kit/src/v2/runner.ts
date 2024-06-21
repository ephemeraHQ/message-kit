import xmtpClient from "./client.js";
import HandlerContext from "./handlerContext.js";
import { ClientOptions } from "@xmtp/xmtp-js";

type Handler = (context: HandlerContext) => Promise<void>;

type Config = {
  client?: any;
};

export default async function runV2(handler: Handler, config?: Config) {
  const client = await xmtpClient(config?.client);
  const { address } = client;

  for await (const message of await client.conversations.streamAllMessages()) {
    try {
      const {
        senderAddress,
        contentType: { typeId },
      } = message;

      if (senderAddress === address) {
        // if same address do nothing
        continue;
      } else if (typeId !== "text") {
        continue;
      }

      /* Abstract some of the concepts in the runner */
      const context = new HandlerContext(
        message.conversation,
        message,
        address,
      );

      await handler(context);
    } catch (e) {
      console.log(`error`, e);
    }
  }
}
