import { Conversation, DecodedMessage } from "@xmtp/xmtp-js";
import { ContentTypeSilent, Silent } from "../content-types/Silent.js";
import HandlerContext from "../lib/handlerContext.js";
import { Metadata } from "./types.js";

export async function grantAccess(
  conversation: Conversation,
  metadata?: Metadata,
) {
  const content: Silent = {
    metadata: {
      type: "access",
      ...metadata,
    },
  };
  // Add group member
  await conversation.send(content, {
    contentType: ContentTypeSilent,
  });
}

export async function ping(
  conversation: Conversation,
  accessHandler: boolean,
  metadata?: Metadata,
) {
  // Send a ping with access handler status
  let content: Silent = {
    metadata: {
      type: "ping",
      access: accessHandler,
      ...metadata,
    },
  };
  await conversation.send(content, {
    contentType: ContentTypeSilent,
  });
}

export async function handleSilentMessage(
  message: DecodedMessage,
  context: HandlerContext,
  accessHandler?: (context: HandlerContext) => Promise<boolean>,
) {
  // Handle silent messages and populate context based on message type
  if (message.contentType.sameAs(ContentTypeSilent)) {
    const messageContent = message.content as Silent;
    if (messageContent.metadata?.type === "access" && accessHandler) {
      const accept = await accessHandler(context);
      if (accept) {
        return grantAccess(message.conversation, messageContent.metadata);
      }
    } else if (messageContent.metadata?.type === "ping") {
      return ping(
        message.conversation,
        (await accessHandler?.(context)) ?? false,
        messageContent.metadata,
      );
    }
  }
  return Promise.resolve(context);
}
