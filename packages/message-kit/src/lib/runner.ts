import { default as HandlerContext } from "./handlerContext.js";
import { default as xmtpClient } from "./client.js";
import { Config, Handler } from "../helpers/types.js";

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
          config?.commandsConfigPath,
          version,
        );
        // Check if the message content triggers a command
        const commandTriggered = context.commands?.some((commandGroup) =>
          commandGroup.triggers.some((trigger) =>
            message?.content?.toLowerCase().startsWith(trigger?.toLowerCase()),
          ),
        );

        if (commandTriggered) {
          if (process?.env?.MSG_LOG === "true") {
            console.log(
              `msg_${version}:`,
              typeof message?.content === "string"
                ? message?.content.substring(0, 20) +
                    (message?.content.length > 20 ? "..." : "")
                : message?.contentType?.typeId ??
                    message?.content?.contentType?.typeId,
            );
          }
          await handler(context);
        }
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
      if (process?.env?.MSG_LOG === "true")
        console.log(`conv_${version}`, conversation?.id ?? conversation.topic);

      try {
        const context = await HandlerContext.create(
          conversation,
          null,
          { client, v2client },
          config?.commandsConfigPath,
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
    //streamConversations("v2"),
    //streamConversations("v3"),
  ]);
}
