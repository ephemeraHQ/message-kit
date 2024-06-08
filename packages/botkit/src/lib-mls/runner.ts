import { HandlerContext } from "./handlerContext.js";
import { ContentTypeSilent } from "../content-types/Silent.js";
import { extractCommandValues } from "../lib/helper.js";
import { ClientOptions, Conversation } from "@xmtp/mls-client";
import { mlsClient } from "./client.js";
import { ContentTypeBotMessage } from "../content-types/Bot.js";
import { ContentTypeText } from "@xmtp/xmtp-js";

type Handler = (context: HandlerContext) => Promise<void>;

export const runGroup = async (
  handler: Handler,
  groupId: string,
  commands: any,
  clientConfig?: ClientOptions,
  accessHandler?: (context: HandlerContext) => Promise<boolean>,
) => {
  const client = await mlsClient(clientConfig);
  const { inboxId } = client;
  await client.conversations.sync();
  const conversations = await client.conversations.list();

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
        const { senderInboxId } = message;

        if (senderInboxId === inboxId) {
          // if same address do nothing
          continue;
        } else if (message.contentType.sameAs(ContentTypeBotMessage)) {
          //if a bot speaks do nothing
          continue;
        }

        let content = message.content;

        if (message.contentType.sameAs(ContentTypeText)) {
          content = {
            content,
          };
          if (content?.content?.startsWith("/")) {
            const extractedValues = extractCommandValues(
              content?.content,
              commands,
            );
            content = {
              ...content,
              params: extractedValues.params,
            };
          }
        }

        const context = new HandlerContext(message, client.accountAddress);

        if (
          message.contentType.sameAs(ContentTypeSilent) &&
          content?.content === "/access" &&
          accessHandler
        ) {
          //if a bot speaks do nothing
          const accept = await accessHandler(context);
          if (accept) {
            // add to group
            grant_access(message.conversation, {});
            continue;
          }
        } else if (
          message.contentType.sameAs(ContentTypeSilent) &&
          content?.content === "/ping"
        ) {
          //if a bot speaks do nothing
          ping(message?.conversation, {}, accessHandler ? true : false);
          continue;
        }
        await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  }
};

async function grant_access(conversation: Conversation, context: any) {
  // add group member
  await conversation.send(
    {
      content: "",
      metadata: {
        type: "access",
        ...context,
      },
    },
    ContentTypeSilent,
  );
}

async function ping(
  conversation: Conversation,
  context: any,
  accessHandler: boolean,
) {
  await conversation.send(
    {
      content: "",
      metadata: {
        type: "ping",
        access: accessHandler,
        ...context,
      },
    },
    ContentTypeSilent,
  );
}
