import { default as HandlerContext } from "./handlerContext.js";
import { default as xmtpClient } from "./client.js";
import { Config, Handler } from "../helpers/types.js";
import { Conversation, DecodedMessage } from "@xmtp/node-sdk";
import { logMessage } from "../helpers/utils.js";
import { OnConnectionLostCallback } from "@xmtp/xmtp-js";
import {
  DecodedMessage as DecodedMessageV2,
  Conversation as ConversationV2,
} from "@xmtp/xmtp-js";

export default async function run(handler: Handler, config?: Config) {
  const { client, v2client } = await xmtpClient(config);
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
        const { isMessageValid, handler: customHandler } =
          commandTriggered(context);
        if (isMessageValid && customHandler) await customHandler(context);
        else await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  };

  const commandTriggered = (context: HandlerContext) => {
    const {
      message: {
        content: { content },
        typeId,
        sender,
      },
      version,
      group,
    } = context;
    let handler = context.findHandler(content, context.commands ?? []);
    const isCommandTriggered = handler?.commands[0]?.command;
    const isExperimental = config?.experimental ?? false;
    const isAddedMemberOrPass =
      group && typeId == "group_updated" && content?.addedInboxes?.length == 0
        ? false
        : true;

    const isRemoteAttachment =
      content?.contentType?.typeId == "remoteStaticAttachment";

    const isAdminOrPass =
      handler?.commands[0]?.adminOnly &&
      group &&
      !group?.isAdmin(sender.inboxId) &&
      !group?.isSuperAdmin(sender.inboxId)
        ? false
        : true;

    // Remote attachments work if image:true
    // Replies only work with explicit mentions from triggers.
    // Text only works with explicit mentions from triggers.
    // Reactions dont work with triggers.

    const isImageValid = isRemoteAttachment && handler?.image;

    const acceptedType = ["text", "remoteStaticAttachment", "reply"].includes(
      typeId ?? "",
    );
    const isMessageValid =
      // v2 only accepts text, remoteStaticAttachment, reply
      version == "v2" && acceptedType
        ? true
        : //If its image is also good, if it has a command image:true
          isImageValid
          ? true
          : //If its not an admin, nope
            !isAdminOrPass
            ? false
            : isExperimental
              ? true
              : //If its a group update but its not an added member, nope
                !isAddedMemberOrPass
                ? false
                : //If it has a command trigger, good
                  isCommandTriggered
                  ? true
                  : false;

    if (process.env.MSG_LOG === "true") {
      console.log("isMessageValid", {
        content,
        version,
        typeId,
        acceptedType,
        isImageValid,
        isAdminOrPass,
        isExperimental,
        isAddedMemberOrPass,
        commandsParsed: context.commands?.length,
        isCommandTriggered,
        handlerName: handler?.name,
        handlerCommand: handler?.commands[0]?.command,
        isMessageValid,
      });
    }
    if (isMessageValid)
      logMessage(`msg_${version}: ` + (typeId == "text" ? content : typeId));

    return {
      isMessageValid,
      handler: handler?.commands[0]?.handler,
    };
  };

  // ... existing code ...
  const handleConnectionLostV3: OnConnectionLostCallback = (error?: Error) => {
    if (error) {
      console.log(`Error in stream_v3:`, error);
    }
  };
  const handleConnectionLostV2: OnConnectionLostCallback = (error?: Error) => {
    if (error) {
      console.log(`Error in stream_v2:`, error);
    }
  };
  const streamMessages = async (version: "v3" | "v2") => {
    const clientToUse = version === "v3" ? client : v2client;

    while (true) {
      try {
        const stream = await clientToUse.conversations.streamAllMessages(
          version === "v3" ? handleConnectionLostV3 : handleConnectionLostV2,
        );
        for await (const message of stream) {
          const conversation =
            version === "v3"
              ? await client.conversations.getConversationById(
                  (message as DecodedMessage)?.conversationId ?? "",
                )
              : (message as DecodedMessageV2)?.conversation;
          handleMessage(version, message, conversation);
        }
      } catch (e) {
        console.log(`Stream error:`, e);
        // Check if the error is a stream disconnected error or similar
        if ((e as Error).message.includes("stream disconnected")) {
          console.log(`Restarting stream due to disconnection...`);
        } else {
          console.log(`Unexpected error, restarting stream...`);
        }
        // Add delay before retry
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // After 5 seconds, the while loop continues
        // which means it will try to create a new stream
        continue;
      }
    }
  };

  // Run both clients' streams concurrently
  await Promise.all([streamMessages("v2"), streamMessages("v3")]);
}
