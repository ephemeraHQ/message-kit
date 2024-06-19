import { Conversation as JsConversation } from "@xmtp/xmtp-js";
import { ContentTypeSilent, Silent } from "../content-types/Silent.js";
import { HandlerContext, CommandGroup, AccessHandler } from "./types.js";
import { Conversation as MlsConversation } from "@xmtp/mls-client";

const isMlsConversation = (
  conversation: JsConversation | MlsConversation,
): conversation is MlsConversation => "sync" in conversation;

export async function grantAccess(
  conversation: JsConversation | MlsConversation,
  accessHandler: AccessHandler,
  context: any,
) {
  // Send a ping with access handler status
  let accept = await accessHandler(context);
  let content: Silent = {
    metadata: {
      type: accept ? "grant_access" : "deny_access",
    },
  };

  if (isMlsConversation(conversation)) {
    await conversation.send(content, ContentTypeSilent);
    return;
  } else {
    await conversation.send(content, {
      contentType: ContentTypeSilent,
    });
    return;
  }
}

export async function commands(
  conversation: JsConversation | MlsConversation,
  commands: CommandGroup[],
) {
  // Send a ping with access handler status
  let content: Silent = {
    metadata: {
      type: "commands",
      commands: commands,
    },
  };

  if (isMlsConversation(conversation)) {
    await conversation.send(content, ContentTypeSilent);
    return;
  } else {
    await conversation.send(content, {
      contentType: ContentTypeSilent,
    });
    return;
  }
}
