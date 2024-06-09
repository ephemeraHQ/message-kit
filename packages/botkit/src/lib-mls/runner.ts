import { HandlerContext } from "./handlerContext.js";
import { ContentTypeSilent } from "../content-types/Silent.js";
import { extractCommandValues } from "../helpers/commands.js";
import { handleSilentMessage } from "../helpers/context.js";
import { ClientOptions, Conversation } from "@xmtp/mls-client";
import { mlsClient } from "./client.js";
import { ContentTypeBotMessage } from "../content-types/Bot.js";
import { ContentTypeText } from "@xmtp/xmtp-js";
import { User } from "../helpers/types";

type Handler = (context: HandlerContext) => Promise<void>;

export const runGroup = async (
  handler: Handler,
  groupId: string,
  newBotConfig?: any,
  clientConfig?: ClientOptions,
  accessHandler?: (context: HandlerContext) => Promise<boolean>,
) => {
  console.log(groupId);
  const client = await mlsClient(clientConfig);
  const { inboxId: address } = client;
  await client.conversations.sync();
  const conversations = await client.conversations.list();
  console.log(conversations);
  let currentUsers: User[] = []; // Initialize currentUsers to hold onto user data across messages

  const group = conversations.find((conversation) => {
    return conversation.id === groupId;
  });

  if (!group) {
    throw new Error("Group not found");
  }

  const stream = group.stream();

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
        } else if (message.contentType.sameAs(ContentTypeBotMessage)) {
          // if a bot speaks do nothing
          continue;
        }

        let content = message.content;
        if (message.contentType.sameAs(ContentTypeText)) {
          if (content?.startsWith("/")) {
            const extractedValues = extractCommandValues(
              content,
              newBotConfig?.context.commands,
              newBotConfig?.context.users,
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

        /* Abstract some of the concepts in the runner */
        const context = new HandlerContext(
          message,
          {
            commands: newBotConfig?.context?.commands ?? {},
            users: currentUsers,
          },
          address,
        );

        if (message.contentType.sameAs(ContentTypeSilent)) {
          await handleSilentMessage(message, context, accessHandler);
          continue;
        }

        await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  }
};
