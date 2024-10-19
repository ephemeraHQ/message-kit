import { default as HandlerContext } from "./handlerContext.js";
import { default as xmtpClient } from "./client.js";
import { Config, Handler } from "../helpers/types.js";
import { Conversation, DecodedMessage, Client } from "@xmtp/node-sdk";
import {
  DecodedMessage as DecodedMessageV2,
  Client as ClientV2,
  Conversation as ConversationV2,
} from "@xmtp/xmtp-js";

export default async function run(handler: Handler, config?: Config) {
  const { client, v2client } = await xmtpClient({
    ...config,
  });
  const { inboxId: address } = client;
  const { address: addressV2 } = v2client;

  // sync and list conversations
  await client.conversations.sync();
  await client.conversations.list();

  const handleMessage = async (
    version: "v3" | "v2",
    message: DecodedMessage | DecodedMessageV2 | undefined,
    conversation: Conversation | ConversationV2 | null,
  ) => {
    if (message && conversation) {
      try {
        const { senderInboxId, kind } = message as DecodedMessage;
        const senderAddress = (message as DecodedMessageV2).senderAddress;

        if (
          //If same address do nothin
          senderAddress?.toLowerCase() === addressV2?.toLowerCase() ||
          //If same address do nothin
          // Filter out membership_change messages
          (senderInboxId?.toLowerCase() === address?.toLowerCase() &&
            kind !== "membership_change")
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
        if (!commandTriggered(version, context, message)) return;
        await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  };

  const commandTriggered = (
    version: "v3" | "v2",
    context: HandlerContext,
    message: DecodedMessage | DecodedMessageV2 | undefined,
  ) => {
    if (process.env.MSG_LOG) {
      //console.log("logs");
      //console.log(message);
    }
    const typeId = message?.contentType?.typeId;
    const isAddedMember =
      typeId == "group_updated" && message?.content?.addedInboxes?.length > 0;

    const isRemoteAttachment =
      message?.contentType?.typeId == "remoteStaticAttachment";

    const isExperimental = config?.experimental;
    // Remote attachments work if image:true
    // Replies only work with explicit mentions from triggers.
    // Text only works with explicit mentions from triggers.
    // Reactions dont work with triggers.
    const commandTriggered = isAddedMember
      ? true
      : version == "v2" &&
          (typeId === "text" ||
            typeId === "remoteStaticAttachment" ||
            typeId === "reply")
        ? true
        : isExperimental
          ? true
          : context.commands?.some((commandGroup) =>
              isRemoteAttachment && commandGroup.image
                ? true
                : commandGroup.triggers.some((trigger) => {
                    switch (typeId) {
                      case "text":
                        return message?.content
                          ?.toLowerCase()
                          .includes(trigger?.toLowerCase());
                      case "reply":
                        return message?.content?.content
                          ?.toLowerCase()
                          .includes(trigger?.toLowerCase());
                      default:
                        return false;
                    }
                  }),
            );
    console.log(commandTriggered);
    if (commandTriggered) {
      console.log(
        `msg_${version}:`,
        typeof message?.content === "string"
          ? message?.content.substring(0, 20) +
              (message?.content.length > 20 ? "..." : "")
          : message?.contentType?.typeId ??
              message?.content?.contentType?.typeId,
      );
    }
    return commandTriggered;
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

  // Run both clients' streams concurrently
  await Promise.all([streamMessages("v2"), streamMessages("v3")]);
}
