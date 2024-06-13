import {
  Conversation as JsConversation,
  DecodedMessage as JsDecodedMessage,
} from "@xmtp/xmtp-js";
import { ContentTypeSilent, Silent } from "../content-types/Silent.js";
import { AccessHandler, HandlerContext, Metadata } from "./types.js";
import {
  DecodedMessage as MlsDecodedMessage,
  Conversation as MlsConversation,
} from "@xmtp/mls-client";

const isMlsConversation = (
  conversation: JsConversation | MlsConversation,
): conversation is MlsConversation => "sync" in conversation;

export async function grantAccess(
  conversation: JsConversation | MlsConversation,
  metadata?: Metadata,
) {
  const content: Silent = {
    metadata: {
      type: "access",
      ...metadata,
    },
  };

  if (isMlsConversation(conversation)) {
    await conversation.send(content, ContentTypeSilent);
    return;
  } else {
    await conversation.send(content, {
      contentType: ContentTypeSilent,
    });
  }
}

export async function ping(
  conversation: JsConversation | MlsConversation,
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

  if (isMlsConversation(conversation)) {
    await conversation.send(content, ContentTypeSilent);
    return;
  } else {
    await conversation.send(content, {
      contentType: ContentTypeSilent,
    });
  }
}

export async function handleSilentMessage(
  conversation: JsConversation | MlsConversation,
  message: JsDecodedMessage | MlsDecodedMessage,
  context: HandlerContext,
  accessHandler?: AccessHandler,
) {
  // Handle silent messages and populate context based on message type
  if (message.contentType.sameAs(ContentTypeSilent)) {
    const messageContent = message.content as Silent;
    if (messageContent.metadata?.type === "access" && accessHandler) {
      const accept = await accessHandler(context);
      if (accept) {
        return grantAccess(conversation, messageContent.metadata);
      }
    } else if (messageContent.metadata?.type === "ping") {
      return ping(
        conversation,
        (await accessHandler?.(context)) ?? false,
        messageContent.metadata,
      );
    }
  }
  return Promise.resolve(context);
}
