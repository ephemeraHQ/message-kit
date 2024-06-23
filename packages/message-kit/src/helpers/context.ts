import { ContentTypeSilent, Silent } from "../content-types/Silent.js";
import { CommandGroup, AccessHandler } from "./types.js";
import { Conversation } from "@xmtp/mls-client";

export async function grantAccess(
  conversation: Conversation,
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

  await conversation.send(content, ContentTypeSilent);
  return;
}

export async function commands(
  conversation: Conversation,
  commands: CommandGroup[],
) {
  // Send a ping with access handler status
  let content: Silent = {
    metadata: {
      type: "commands",
      commands: commands,
    },
  };

  await conversation.send(content, ContentTypeSilent);
  return;
}
