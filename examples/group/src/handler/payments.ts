import { HandlerContext } from "message-kit";
import {
  RemoteAttachmentCodec,
  RemoteAttachment,
  Attachment,
} from "@xmtp/content-type-remote-attachment";

export async function handler(context: HandlerContext) {
  if (!process.env.OPEN_AI_API_KEY) {
    return context.reply("No OpenAI API key found");
  }
  const {
    client,
    message: { content },
  } = context;

  const remoteAttachment: RemoteAttachment = content;

  const attachment: Attachment = await RemoteAttachmentCodec.load(
    remoteAttachment,
    client, // <- Your XMTP Client instance
  );
  console.log(attachment);
  /*
  let explanation = await interpretImage(url);
  console.log(explanation);*/
}
