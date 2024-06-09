import xmtpClient from "./client.js";
import HandlerContext from "./handler-context.js";
import { ContentTypeSilent } from "../content-types/Silent.js";
import { ContentTypeBotMessage } from "../content-types/Bot.js";
import { extractCommandValues } from "./commands.js";
import { handleSilentMessage } from "./context.js";

type Handler = (context: HandlerContext) => Promise<void>;

export default async function run(
  handler: Handler,
  newBotConfig?: any,
  accessHandler?: (context: HandlerContext) => Promise<boolean>,
) {
  const client = await xmtpClient(newBotConfig);
  const { address } = client;
  let currentUsers = {}; // Initialize currentUsers to hold onto user data across messages

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

      let content = message.content;
      if (typeId == "text") {
        if (content?.startsWith("/")) {
          const extractedValues = extractCommandValues(
            content,
            newBotConfig?.context.commands,
            newBotConfig?.context.users,
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
      // Update currentUsers based on metadata, replace if empty array provided
      if (Array.isArray(metadata?.users) && metadata.users.length === 0) {
        currentUsers = {}; // Reset if empty array
      } else if (metadata?.users) {
        currentUsers = metadata.users; // Update if users are provided
      }

      const context = new HandlerContext(
        {
          id: message.id,
          content,
          senderAddress,
          typeId,
          sent: message.sent,
        },
        {
          commands: newBotConfig?.context?.commands ?? {},
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
