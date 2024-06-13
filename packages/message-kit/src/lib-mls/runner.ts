import { HandlerContext } from "./handlerContext.js";
import { ContentTypeSilent } from "../content-types/Silent.js";
import { extractCommandValues } from "../helpers/commands.js";
import { handleSilentMessage } from "../helpers/context.js";
import { Client, ClientOptions } from "@xmtp/mls-client";
import { mlsClient } from "./client.js";
import { ContentTypeBotMessage } from "../content-types/BotMessage.js";
import { ContentTypeText } from "@xmtp/xmtp-js";
import { AccessHandler, CommandGroup, User } from "../helpers/types";

type Handler = (context: HandlerContext) => Promise<void>;

type BotConfig = {
  users?: User[];
  commands?: CommandGroup[];
};

type Config = {
  bot?: BotConfig;
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

export const runGroup = async (handler: Handler, config?: Config) => {
  const client = await mlsClient(config?.client);
  const { inboxId: address } = client;
  let currentUsers: User[] = []; // Initialize currentUsers to hold onto user data across messages

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

        if (senderAddress === address) {
          // if same address do nothing
          continue;
        } else if (contentType.sameAs(ContentTypeBotMessage)) {
          // if a bot speaks do nothing
          continue;
        }

        let content = message.content;
        if (contentType.sameAs(ContentTypeText)) {
          if (content?.startsWith("/")) {
            const extractedValues = extractCommandValues(
              content,
              config?.bot?.commands ?? [],
              config?.bot?.users ?? [],
            );
            content = {
              content: content,
              ...extractedValues,
            };
          } else {
            content = {
              content: content,
            };
          }
        }
        // Update currentUsers based on metadata, replace if empty array provided
        if (Array.isArray(metadata?.users) && metadata.users.length === 0) {
          currentUsers = []; // Reset if empty array
        } else if (metadata?.users) {
          currentUsers = metadata.users; // Update if users are provided
        }

        const conversation = await getConversationById(
          client,
          message.conversationId,
        );

        /* Abstract some of the concepts in the runner */
        const context = new HandlerContext(
          conversation,
          message,
          {
            commands: config?.bot?.commands ?? [],
            users: currentUsers,
          },
          address,
        );

        if (message.contentType.sameAs(ContentTypeSilent)) {
          await handleSilentMessage(
            conversation,
            message,
            context,
            config?.accessHandler,
          );
          continue;
        }

        await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  }
};
