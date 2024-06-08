import xmtpClient from "./client.js";
import HandlerContext from "./handler-context.js";
import { ContentTypeSilent } from "../content-types/Silent.js";
import { extractCommandValues } from "./helper.js";

type Handler = (context: HandlerContext) => Promise<void>;

export default async function run(
  handler: Handler,
  newBotConfig?: any,
  accessHandler?: (context: HandlerContext) => Promise<boolean>,
) {
  const client = await xmtpClient(newBotConfig);
  const { address } = client;
  for await (const message of await client.conversations.streamAllMessages()) {
    try {
      const {
        senderAddress,
        contentType: { typeId },
      } = message;

      if (senderAddress === address) {
        // if same address do nothing
        continue;
      } else if (typeId == "bot") {
        //if a bot speaks do nothing
        continue;
      }

      let content = message.content;
      if (typeId == "text") {
        content = {
          content: content,
        };
        if (content?.content?.startsWith("/")) {
          const extractedValues = extractCommandValues(
            content?.content,
            newBotConfig?.context.commands,
            newBotConfig?.context.users,
          );

          content = {
            ...content,
            ...extractedValues,
          };
        }
      }

      const context = new HandlerContext(
        {
          id: message.id,
          content,
          senderAddress,
          typeId,
          sent: message.sent,
        },
        newBotConfig?.context ?? {},
        message.conversation,
        address,
      );
      if (
        typeId == "silent" &&
        content?.content === "/access" &&
        accessHandler
      ) {
        //if a bot speaks do nothing
        const accept = await accessHandler(context);
        if (accept) {
          // add to group
          grant_access(message, newBotConfig?.context);
          continue;
        }
      } else if (typeId == "silent" && content?.content === "/ping") {
        //if a bot speaks do nothing
        ping(
          message?.conversation,
          newBotConfig?.context,
          accessHandler ? true : false,
        );
        continue;
      }
      await handler(context);
    } catch (e) {
      console.log(`error`, e);
    }
  }
}

async function grant_access(conversation: any, context: any) {
  // add group member
  await conversation.send(
    {
      content: "",
      metadata: {
        type: "access",
        ...context,
      },
    },
    {
      contentType: ContentTypeSilent,
    },
  );
}
async function ping(conversation: any, context: any, accessHandler: boolean) {
  await conversation.send(
    {
      content: "",
      metadata: {
        type: "ping",
        access: accessHandler,
        ...context,
      },
    },
    {
      contentType: ContentTypeSilent,
    },
  );
}
