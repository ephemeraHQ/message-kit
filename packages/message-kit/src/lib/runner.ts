import { default as HandlerContext } from "./handlerContext.js";
import { default as xmtpClient } from "./client.js";
import { ContentTypeBotMessage } from "../content-types/BotMessage.js";
import { Config, Handler } from "../helpers/types.js";

export default async function run(handler: Handler, config?: Config) {
  const { client, v2client } = await xmtpClient(config?.client);
  const { inboxId: address } = client;
  const { address: addressV2 } = v2client;

  // sync and list conversations
  await client.conversations.sync();
  await client.conversations.list();

  const handleMessage = async (client: any, address: string, message: any) => {
    if (message) {
      try {
        const { senderInboxId, contentType, senderAddress } = message;

        const conversation = client.conversations.getConversationById
          ? await client.conversations.getConversationById(
              message.conversationId,
            )
          : message?.conversation;

        if (
          //v2
          !conversation ||
          //If same address do nothin
          senderAddress === addressV2 ||
          //If same address do nothin
          senderInboxId === address ||
          //If is bot type nothing
          contentType.sameAs(ContentTypeBotMessage)
        ) {
          return;
        }

        const context = await HandlerContext.create(
          conversation,
          message,
          client,
          config?.commands ?? [],
          config?.commandHandlers ?? {},
          config?.agentHandlers ?? {},
        );

        await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  };

  const streamMessages = async (client: any, address: string) => {
    while (true) {
      const stream = await client.conversations.streamAllMessages();
      try {
        for await (const message of stream) {
          if (process?.env?.MSG_LOG) {
            console.log(`message:`, message.content);
          }
          await handleMessage(client, address, message);
        }
      } catch (e) {
        console.log(`Restart stream:`, e);
      }
    }
  };

  // Run both clients' streams concurrently
  await Promise.all([
    streamMessages(v2client, addressV2),
    streamMessages(client, address),
  ]);
}
