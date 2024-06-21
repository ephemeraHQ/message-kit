import { default as HandlerContext } from "./handlerContext.js";
import { Client, ClientOptions } from "@xmtp/mls-client";
import { default as xmtpClient } from "./client.js";
import { ContentTypeSilent } from "../content-types/Silent.js";
import { ContentTypeBotMessage } from "../content-types/BotMessage.js";
import { AccessHandler, CommandGroup, User } from "../helpers/types.js";
import { grantAccess, commands } from "../helpers/context.js";

type Handler = (context: HandlerContext) => Promise<void>;

type Config = {
  commands?: CommandGroup[];
  client?: ClientOptions;
  accessHandler?: AccessHandler;
};
/**
 * Get a conversation by id
 *
 * If not found, sync and list conversations to update the internal mapping
 * If still not found, throw an error
 */
const getConversationById = async (client: Client, id: string) => {
  const conversation = client.conversations.get(id);
  if (!conversation) {
    await client.conversations.sync();
    await client.conversations.list();
    const conversation = client.conversations.get(id);
    if (!conversation) {
      throw new Error(`Conversation not found: ${id}`);
    }
    return conversation;
  }
  return conversation;
};

export default async function run(handler: Handler, config?: Config) {
  const client = await xmtpClient(config?.client);
  const { inboxId: address } = client;

  // sync and list conversations
  await client.conversations.sync();
  await client.conversations.list();

  // start streaming groups so that they are added to the internal mapping
  const groupStream = client.conversations.stream();

  // start streaming all messages from all groups
  const stream = await client.conversations.streamAllMessages();

  for await (const message of stream) {
    if (message) {
      try {
        const {
          senderInboxId: senderAddress,
          contentType,
          content: { metadata },
        } = message;

        const conversation = await getConversationById(
          client,
          message.conversationId,
        );

        if (senderAddress === address) {
          // if same address do nothing
          continue;
        } else if (contentType.sameAs(ContentTypeBotMessage)) {
          // if a bot speaks do nothing
          continue;
        } else if (contentType.sameAs(ContentTypeSilent)) {
          if (metadata?.type === "request_access" && config?.accessHandler) {
            /*Still in prototype phase. If the app detects a user does not have access to the group, the app will send a SilentContentType to the group and this will be catched by the bot. The bot in case it has access will grant access to the user.*/
            grantAccess(conversation, config?.accessHandler, {
              sender: senderAddress,
              conversationId: conversation.id,
            });
          } else if (metadata?.type === "ping") {
            /*When opening a conversation or adding a member or arbitrarily the app can ping the bots and the bots can reply with their commands*/
            commands(conversation, config?.commands ?? []);
          }
          continue;
        }

        /* Abstract some of the concepts in the runner */
        const context = new HandlerContext(
          conversation,
          message,
          client,
          config?.commands ?? [],
        );

        await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  }
}
