import { default as HandlerContext } from "./handlerContext.js";
import { default as xmtpClient } from "./client.js";
import { Config, Handler } from "../helpers/types.js";
import { Conversation, DecodedMessage } from "@xmtp/node-sdk";
import { logMessage } from "../helpers/utils.js";
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
      client,
      v2client,
      group,
    } = context;
    let handler = context.findHandler(content, context.commands ?? []);

    const { inboxId: senderInboxId } = client;
    const { address: senderAddress } = v2client;

    const isSameAddress =
      sender.address?.toLowerCase() === senderAddress?.toLowerCase() ||
      (sender.inboxId?.toLowerCase() === senderInboxId.toLowerCase() &&
        typeId !== "group_updated");

    const isCommandTriggered = handler?.commands[0]?.command;
    const isExperimental = config?.experimental ?? false;

    const isAddedMemberOrPass =
      typeId === "group_updated" &&
      config?.memberChange &&
      content?.addedInboxes?.length === 0
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

    // Remote attachments work if image:true in runner config
    // Replies only work with explicit mentions from triggers.
    // Text only works with explicit mentions from triggers.
    // Reactions dont work with triggers.

    const isImageValid = isRemoteAttachment && config?.attachments;

    const acceptedType = ["text", "remoteStaticAttachment", "reply"].includes(
      typeId ?? "",
    );

    const isMessageValid = !isSameAddress
      ? false
      : // v2 only accepts text, remoteStaticAttachment, reply
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
        isSameAddress,
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
  const getConversation = async (
    message: DecodedMessage | DecodedMessageV2 | undefined,
    version: "v3" | "v2",
  ) => {
    return version === "v3"
      ? await client.conversations.getConversationById(
          (message as DecodedMessage)?.conversationId ?? "",
        )
      : (message as DecodedMessageV2)?.conversation;
  };
  const STREAM_LOG = process.env.STREAM_LOG === "true";
  async function streamMessages(version: "v3" | "v2") {
    const clientToUse = version === "v3" ? client : v2client;
    let retryCount = 0;
    const MAX_RETRY_DELAY = 5000; // max 5 seconds

    while (true) {
      try {
        // Log when attempting to establish the stream
        if (STREAM_LOG)
          console.log(`[${version}] Attempting to start client stream...`);

        const stream = await clientToUse.conversations.streamAllMessages();

        // Log successful connection or reconnection
        if (retryCount > 0) {
          if (STREAM_LOG)
            console.log(
              `[${version}] Successfully reconnected after ${retryCount} retries.`,
            );
          retryCount = 0;
        } else {
          if (STREAM_LOG)
            console.log(`[${version}] Client stream started successfully.`);
        }

        try {
          for await (const message of stream) {
            const conversation = await getConversation(message, version);
            await handleMessage(version, message, conversation);
          }
          // If the stream ends without errors, log it
          if (STREAM_LOG)
            console.warn(
              `[${version}] Stream ended unexpectedly. Reconnecting...`,
            );
          // Artificially throw an error to trigger reconnection
          throw new Error("Stream ended unexpectedly");
        } catch (e) {
          // Log the stream error
          if (STREAM_LOG) console.warn(`[${version}] Stream error:`, e);
          // Re-throw the error to trigger the outer catch block
          throw e;
        }
      } catch (e) {
        retryCount++;
        if (STREAM_LOG)
          console.error(
            `[${version}] Connection dropped. Attempting to reconnect in ${MAX_RETRY_DELAY / 1000} seconds...`,
          );
        if (STREAM_LOG) console.error(`[${version}] Error details:`, e);
        await new Promise((resolve) => setTimeout(resolve, MAX_RETRY_DELAY));
      }
    }
  }
  // Run both clients' streams concurrently
  await Promise.all([streamMessages("v2"), streamMessages("v3")]);
}
