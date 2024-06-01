import xmtpClient from "./client.js";
import HandlerContext from "./handler-context.js";

type Handler = (context: HandlerContext) => Promise<void>;

export default async function run(handler: Handler, newBotConfig?: any) {
  const client = await xmtpClient(newBotConfig);

  for await (const message of await client.conversations.streamAllMessages()) {
    try {
      if (message.senderAddress === client.address) {
        // if same address do nothing
        continue;
      } else if (message.contentType.typeId == "bot") {
        //if a bot speaks do nothing
        continue;
      }

      const context = new HandlerContext(message, newBotConfig, client.address);

      await handler(context);
    } catch (e) {
      console.log(`error`, e);
    }
  }
}
