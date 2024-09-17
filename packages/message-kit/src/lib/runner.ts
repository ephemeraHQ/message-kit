import { default as HandlerContext } from "./handlerContext.js";
import { default as xmtpClient } from "./client.js";
import { Config, Handler } from "../helpers/types.js";
import { Client } from "@xmtp/mls-client";
import { Client as ClientV2 } from "@xmtp/xmtp-js";

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
    { client, v2client }: { client: Client; v2client: ClientV2 },
    address: string,
    version: "v3" | "v2",
    message: any,
  ) => {
    if (message) {
      if (process?.env?.ISSUE_LOG) {
        let content =
          typeof message?.content === "string"
            ? message?.content
            : message?.contentType.typeId;
        console.log(`stream:`, content, message?.conversationId);
      }
      try {
        const { senderInboxId, senderAddress } = message;
        let conversation;
        if (version === "v3") {
          conversation = client.conversations.getConversationById
            ? await client.conversations.getConversationById(
                message.conversationId,
              )
            : message?.conversation;
        } else {
          conversation = message?.conversation;
        }
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

  const streamMessages = async (
    { client, v2client }: { client: Client; v2client: ClientV2 },
    address: string,
    version: "v3" | "v2",
  ) => {
    if (version === "v3") {
      while (true) {
        const stream = await client.conversations.streamAllMessages();
        try {
          for await (const message of stream) {
            await handleMessage(
              { client, v2client },
              address,
              version,
              message,
            );
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
            await handleMessage(
              { client, v2client },
              address,
              version,
              message,
            );
          }
        } catch (e) {
          console.log(`Restart stream:`, e);
        }
      }
    }
  };

  // Run both clients' streams concurrently
  await Promise.all([
    streamMessages({ client, v2client }, address, "v2"),
    streamMessages({ client, v2client }, address, "v3"),
  ]);
}
