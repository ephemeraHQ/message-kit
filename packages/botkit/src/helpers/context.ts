import { ContentTypeSilent } from "../content-types/Silent.js";

export async function grantAccess(conversation: any, metadata: any) {
  // Add group member
  await conversation.send(
    {
      content: "",
      metadata: {
        type: "access",
        ...metadata,
      },
    },
    {
      contentType: ContentTypeSilent,
    },
  );
}

export async function ping(
  conversation: any,
  metadata: any,
  accessHandler: boolean,
) {
  // Send a ping with access handler status
  let content = {
    content: "",
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

export function handleSilentMessage(
  message: any,
  context: any,
  accessHandler?: (context: any) => Promise<boolean>,
) {
  // Handle silent messages and populate context based on message type
  if (message.contentType.sameAs(ContentTypeSilent)) {
    if (message.content.metadata.type === "access" && accessHandler) {
      return accessHandler(context).then((accept) => {
        if (accept) {
          return grantAccess(message.conversation, message.content.metadata);
        }
      });
    } else if (message.content.metadata.type === "ping") {
      return ping(
        message.conversation,
        message.content.metadata,
        !!accessHandler,
      );
    }
  }
  return Promise.resolve(context);
}
