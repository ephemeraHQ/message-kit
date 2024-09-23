import { default as HandlerContext } from "./handlerContext.js";
import { default as xmtpClient } from "./client.js";
import { Config, Handler } from "../helpers/types.js";
import { Conversation, DecodedMessage, Client } from "@xmtp/mls-client";
import {
  DecodedMessage as DecodedMessageV2,
  Client as ClientV2,
  Conversation as ConversationV2,
} from "@xmtp/xmtp-js";

export default async function run(handler: Handler, config?: Config) {
  const { client, v2client } = await xmtpClient(
    config?.client,
    config?.privateKey,
  );
  const { inboxId: address } = client;
  const { address: addressV2 } = v2client;

  // sync and list conversations
  await client.conversations.sync();
  await client.conversations.list();

  const handleMessage = async (
    version: "v3" | "v2",
    message: any,
    conversation: any,
  ) => {
    if (message) {
      try {
        const { senderInboxId, senderAddress } = message;

        if (
          //If same address do nothin
          senderAddress === addressV2 ||
          //If same address do nothin
          senderInboxId === address
        ) {
          return;
        }

        const context = await HandlerContext.create(
          conversation,
          message,
          { client, v2client },
          config?.commands ?? [],
          config?.commandHandlers ?? {},
          version,
        );

        await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  };

  const streamMessages = async (version: "v3" | "v2") => {
    if (version === "v3") {
      while (true) {
        const stream = await client.conversations.streamAllMessages();
        try {
          for await (const message of stream) {
            if (process?.env?.MSG_LOG) {
              console.log(
                `msg_${version}:`,
                typeof message?.content === "string"
                  ? message?.content.substring(0, 100)
                  : message?.contentType?.typeId ??
                      message?.content?.contentType?.typeId,
              );
            }

            const conversation = await client.conversations.getConversationById(
              message?.conversationId ?? "",
            );
            handleMessage(version, message, conversation);
          }
        } catch (e) {
          console.log(`Restart stream:`, e);
        }
      }
    } else if (version === "v2") {
      while (true) {
        const stream = await v2client.conversations.streamAllMessages();
        try {
          for await (const message of stream) {
            if (process?.env?.MSG_LOG) {
              console.log(
                `msg_${version}:`,
                typeof message?.content === "string"
                  ? message?.content.substring(0, 100)
                  : message?.contentType?.typeId ??
                      message?.content?.contentType?.typeId,
              );
            }

            handleMessage(version, message, message.conversation);
          }
        } catch (e) {
          console.log(`Restart stream:`, e);
        }
      }
    }
  };

  const streamConversations = async (version: "v3" | "v2") => {
    if (version === "v3") {
      while (true) {
        const stream = await client.conversations.stream();
        try {
          for await (const conversation of stream) {
            if (process?.env?.MSG_LOG)
              console.log(`conv_${version}`, conversation?.id);
            handleConversation(version, conversation);
          }
        } catch (e) {
          console.log(`Restart conversation stream:`, e);
        }
      }
    } else if (version === "v2") {
      while (true) {
        const stream = await v2client.conversations.stream();
        try {
          for await (const conversation of stream) {
            if (process?.env?.MSG_LOG)
              console.log(`conv_${version}`, conversation?.topic);
            handleConversation(version, conversation);
          }
        } catch (e) {
          console.log(`Restart conversation stream:`, e);
        }
      }
    }
  };
  const handleConversation = async (
    version: "v3" | "v2",
    conversation: any,
  ) => {
    if (conversation) {
      try {
        const context = await HandlerContext.create(
          conversation,
          null,
          { client, v2client },
          config?.commands ?? [],
          config?.commandHandlers ?? {},
          version,
        );

        await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  };
  // Run both clients' streams concurrently
  await Promise.all([
    streamMessages("v2"),
    streamMessages("v3"),
    streamConversations("v2"),
    streamConversations("v3"),
  ]);
}
