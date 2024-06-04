import xmtpClient from "./client.js";
import HandlerContext from "./handler-context.js";
import { ContentTypeSilent } from "../content-types/Silent.js";

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
        content,
        contentType: { typeId },
      } = message;

      if (senderAddress === address) {
        // if same address do nothing
        continue;
      } else if (typeId == "bot") {
        //if a bot speaks do nothing
        continue;
      }
      const context = new HandlerContext(
        message,
        newBotConfig?.context ?? {},
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
        ping(message, newBotConfig?.context, accessHandler);
        continue;
      }

      await handler(context);
    } catch (e) {
      console.log(`error`, e);
    }
  }
}

async function grant_access(message: any, context: any) {
  // add group member
  await message.conversation.send(
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
async function ping(message: any, context: any, accessHandler: any) {
  await message.conversation.send(
    {
      content: "",
      metadata: {
        type: "ping",
        access: accessHandler ? true : false,
        ...context,
      },
    },
    {
      contentType: ContentTypeSilent,
    },
  );
}
