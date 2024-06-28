import { default as HandlerContext } from "./handlerContext.js";
import { default as xmtpClient } from "./client.js";
import { ContentTypeBotMessage } from "../content-types/BotMessage.js";
import { Config, Handler } from "../helpers/types.js";

export default async function run(handler: Handler, config?: Config) {
  const client = await xmtpClient(config?.client);
  const { inboxId: address } = client;

  // sync and list conversations
  await client.conversations.sync();
  await client.conversations.list();

  // start streaming all messages from all groups
  const stream = await client.conversations.streamAllMessages();

  for await (const message of stream) {
    if (message) {
      try {
        const { senderInboxId, contentType } = message;

        const conversation = await client.conversations.getConversationById(
          message.conversationId,
        );

        if (!conversation) continue;
        else if (senderInboxId === address) {
          // if same address do nothing
          continue;
        } else if (contentType.sameAs(ContentTypeBotMessage)) {
          // if a bot speaks do nothing
          continue;
        } /* ‼️ Soon to be deprecated
        /*
        If the app detects a user does not have access to the group, the app will send a SilentContentType to the group and this will be catched by the bot. The bot in case it has access will grant access to the user.*/
        /*
          if (metadata?.type === "request_access" && config?.accessHandler) {
           grantAccess(conversation, config?.accessHandler, {
              sender: senderInboxId,
              conversationId: conversation.id,
            });
          } else if (metadata?.type === "ping") {
            //When opening a conversation or adding a member or arbitrarily the app can ping the bots and the bots can reply with their commands
            commands(conversation, config?.commands ?? []);
          }
          continue;
        }*/

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
  }
}
