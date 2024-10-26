import { default as HandlerContext } from "./handlerContext.js";
import { default as xmtpClient } from "./client.js";
import { Config, Handler } from "../helpers/types.js";
import { Conversation, DecodedMessage } from "@xmtp/node-sdk";
import { logMessage } from "../helpers/helpers.js";
import {
  DecodedMessage as DecodedMessageV2,
  Conversation as ConversationV2,
} from "@xmtp/xmtp-js";

export default async function run(handler: Handler, config?: Config) {
  const { client, v2client } = await xmtpClient(config ?? {});
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
        if (!commandTriggered(context)) return;
        await handler(context);
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
    const isCommandTriggered = handler?.triggers.some((trigger) => {
      switch (typeId) {
        case "text":
          return content?.toLowerCase().includes(trigger?.toLowerCase());
        case "reply":
          return content?.content
            ?.toLowerCase()
            .includes(trigger?.toLowerCase());
        default:
          return false;
      }
    });
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
      console.log("isMessageValid:", isMessageValid, {
        content,
        version,
        typeId,
        acceptedType,
        isImageValid,
        isAdminOrPass,
        isExperimental,
        isAddedMemberOrPass,
        isCommandTriggered,
        handlerName: handler?.name,
        handlerCommand: handler?.commands[0]?.command,
      });
    }
    if (isMessageValid)
      logMessage(`msg_${version}: ` + (typeId == "text" ? content : typeId));

    return isMessageValid;
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
