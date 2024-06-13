import xmtpClient from "./client.js";
import HandlerContext from "./handlerContext.js";
import { ContentTypeSilent } from "../content-types/Silent.js";
import { ContentTypeBotMessage } from "../content-types/BotMessage.js";
import { extractCommandValues } from "../helpers/commands.js";
import { handleSilentMessage } from "../helpers/context.js";
import { ContentTypeText } from "@xmtp/xmtp-js";
import { User } from "../helpers/types.js";

type Handler = (context: HandlerContext) => Promise<void>;

export default async function run(
  handler: Handler,
  appConfig?: any,
  accessHandler?: (context: HandlerContext) => Promise<boolean>,
) {
  const client = await xmtpClient(appConfig);
  const { address } = client;
  let currentUsers: User[] = []; // Initialize currentUsers to hold onto user data across messages

  for await (const message of await client.conversations.streamAllMessages()) {
    try {
      const {
        senderAddress,
        contentType: { typeId },
        content: { metadata },
      } = message;

      if (senderAddress === address) {
        // if same address do nothing
        continue;
      } else if (message.contentType.sameAs(ContentTypeBotMessage)) {
        // if a bot speaks do nothing
        continue;
      }

      // Update currentUsers based on metadata, replace if empty array provided
      if (Array.isArray(metadata?.users) && metadata.users.length === 0) {
        currentUsers = []; // Reset if empty array
      } else if (metadata?.users) {
        currentUsers = metadata.users; // Update if users are provided
      }

      let content = message.content;
      if (message.contentType.sameAs(ContentTypeText)) {
        if (content?.startsWith("/")) {
          const extractedValues = extractCommandValues(
            content,
            appConfig?.context.commands,
            currentUsers,
          );
          content = {
            content: content,
            ...extractedValues,
          };
        } else {
          content = {
            content: content,
          };
        }
      }

      /* Abstract some of the concepts in the runner */
      const context = new HandlerContext(
        {
          id: message.id,
          content,
          senderAddress,
          typeId,
          sent: message.sent,
        },
        {
          commands: appConfig?.context?.commands ?? {},
          users: currentUsers,
        },
        message.conversation,
        address,
      );

      if (message.contentType.sameAs(ContentTypeSilent)) {
        await handleSilentMessage(message, context, accessHandler);
        continue;
      }

      await handler(context);
    } catch (e) {
      console.log(`error`, e);
    }
  }
}
