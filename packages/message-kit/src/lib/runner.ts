import { XMTPContext } from "./xmtp.js";
import { xmtpClient } from "./client.js";
import { RunConfig, Handler, SkillHandler } from "../helpers/types.js";
import { DecodedMessage } from "@xmtp/node-sdk";
import { logMessage } from "../helpers/utils.js";
import { DecodedMessage as DecodedMessageV2 } from "@xmtp/xmtp-js";
import { streamMessages } from "./streams.js";
import { findSkill } from "./skills.js";
import { Conversation } from "@xmtp/node-sdk";
import { Conversation as V2Conversation } from "@xmtp/xmtp-js";
import { awaitedHandlers } from "./xmtp.js";

export async function run(handler: Handler, runConfig?: RunConfig) {
  const { client, v2client } = await xmtpClient(runConfig);

  const { inboxId: address } = client;
  const { address: addressV2 } = v2client;

  // sync and list conversations
  await client.conversations.sync();
  await client.conversations.list();
  const handleMessage = async (
    version: "v3" | "v2",
    message: DecodedMessage | DecodedMessageV2 | undefined,
  ) => {
    const conversation = await getConversation(message, version);
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
        const context = await XMTPContext.create(
          conversation,
          message,
          { client, v2client },
          runConfig ?? {},
          version,
        );
        if (!context) {
          logMessage("No context found" + message);
          return;
        }

        //Await response
        const awaitedHandler = awaitedHandlers.get(
          context.getConversationKey(),
        );
        if (awaitedHandler) {
          const messageText =
            context.message.content.text || context.message.content.reply || "";
          // Check if the response is from the expected user
          const expectedUser = context.getConversationKey().split(":")[1];
          const actualSender =
            version === "v3"
              ? (message as DecodedMessage).senderInboxId
              : (message as DecodedMessageV2).senderAddress;

          if (expectedUser?.toLowerCase() === actualSender?.toLowerCase()) {
            const isValidResponse = await awaitedHandler(messageText);
            // Only remove the handler if we got a valid response
            if (isValidResponse) {
              awaitedHandlers.delete(context.getConversationKey());
            }
          }
          return;
        }

        // Check if the message content triggers a skill
        const { isMessageValid, customHandler } = filterMessage(context);
        if (isMessageValid && customHandler) await customHandler(context);
        else if (isMessageValid) await handler(context);
      } catch (e) {
        console.log(`error`, e);
      }
    }
  };

  const filterMessage = (
    context: XMTPContext,
  ): {
    isMessageValid: boolean;
    customHandler: SkillHandler | undefined;
  } => {
    const {
      message: {
        content: { text },
        content,
        typeId,
        sender,
      },
      version,
      client,
      v2client,
      agent,
      runConfig,
      group,
    } = context;

    let foundSkill = text?.startsWith("/")
      ? findSkill(text, agent.skills)
      : undefined;

    const { inboxId: senderInboxId } = client;
    const { address: senderAddress } = v2client;

    const isSameAddress =
      sender.address?.toLowerCase() === senderAddress?.toLowerCase() ||
      (sender.inboxId?.toLowerCase() === senderInboxId.toLowerCase() &&
        typeId !== "group_updated");

    const isSkillTriggered = foundSkill?.skill;
    const isExperimental = runConfig?.experimental ?? false;

    const isAddedMemberOrPass =
      typeId === "group_updated" &&
      runConfig?.memberChange &&
      //@ts-ignore
      content?.addedInboxes?.length === 0
        ? false
        : true;

    const isRemoteAttachment = typeId == "remoteStaticAttachment";

    const isAdminSkill = foundSkill?.adminOnly ?? false;

    const isAdmin =
      group &&
      (group?.admins.includes(sender.inboxId) ||
        group?.superAdmins.includes(sender.inboxId))
        ? true
        : false;

    const isAdminOrPass = isAdminSkill && !isAdmin ? false : true;

    // Remote attachments work if image:true in runner config
    // Replies only work with explicit mentions from triggers.
    // Text only works with explicit mentions from triggers.
    // Reactions don't work with triggers.

    const isImageValid = isRemoteAttachment && runConfig?.attachments;

    const acceptedType = [
      "text",
      "remoteStaticAttachment",
      "reply",
      "skill",
    ].includes(typeId ?? "");
    // Check if the message content triggers a tag
    const isTagged = text?.includes(`${agent?.tag}`) ?? false;
    const isMessageValid = isSameAddress
      ? false
      : // v2 only accepts text, remoteStaticAttachment, reply
        version == "v2" && acceptedType
        ? true
        : //If its image is also good, if it has a skill image:true
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
                : //If it has a skill trigger, good
                  isSkillTriggered
                  ? true
                  : //If it has a tag trigger, good
                    isTagged
                    ? true
                    : false;

    if (process.env.MSG_LOG === "true") {
      logMessage({
        isSameAddress,
        openai: {
          model: process?.env?.GPT_MODEL,
          key: process?.env?.OPENAI_API_KEY ? "[SET]" : "[NOT SET]",
        },
        content,
        version,
        acceptedType,
        attachmentDetails: {
          isRemoteAttachment,
          isImageValid,
        },
        adminDetails: {
          isAdminSkill,
          isAdmin,
          isAdminOrPass,
        },
        isAddedMemberOrPass,
        skillsParsed: agent?.skills?.length,
        taggingDetails: {
          tag: agent?.tag,
          isTagged,
        },
        skillTriggerDetails: isSkillTriggered
          ? {
              skill: foundSkill?.skill,
              examples: foundSkill?.examples,
              description: foundSkill?.description,
              params: foundSkill?.params
                ? Object.entries(foundSkill.params).map(([key, value]) => ({
                    key,
                    value: {
                      type: value.type,
                      values: value.values,
                      plural: value.plural,
                      default: value.default,
                    },
                  }))
                : undefined,
            }
          : !text?.startsWith("/")
            ? "Natural prompt, yet to be parsed"
            : "No skill trigger detected",
        isMessageValid,
      });
    }
    if (isMessageValid) logMessage(`msg_${version}: ` + (text ?? typeId));

    return {
      isMessageValid,
      customHandler: foundSkill?.handler,
    };
  };
  const getConversation = async (
    message: DecodedMessage | DecodedMessageV2 | undefined,
    version: "v3" | "v2",
  ): Promise<Conversation | V2Conversation> => {
    return version === "v3"
      ? ((await client.conversations.getConversationById(
          (message as DecodedMessage)?.conversationId as string,
        )) as Conversation)
      : ((message as DecodedMessageV2)?.conversation as V2Conversation);
  };
  // Run both clients' streams concurrently
  await Promise.all([
    streamMessages("v3", handleMessage, client),
    streamMessages("v2", handleMessage, v2client),
  ]);
}
