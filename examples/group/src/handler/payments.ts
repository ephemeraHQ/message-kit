import { HandlerContext } from "message-kit";
import { vision, text } from "../lib/openai.js";
import {
  RemoteAttachmentCodec,
  Attachment,
} from "@xmtp/content-type-remote-attachment";

export async function handler(context: HandlerContext) {
  if (!process.env.OPEN_AI_API_KEY) {
    return context.reply("No OpenAI API key found");
  }
  const {
    client,
    members,
    commands,
    message: { content: remoteAttachment, sender },
  } = context;
  const attachment: Attachment = await RemoteAttachmentCodec.load(
    remoteAttachment,
    client,
  );
  if (attachment && attachment.data) {
    const response = await vision(
      attachment.data,
      "This image is the bill of a restaurant dinner. Return the total. If you can't find the total, return 'undefined'.",
    );
    if (response?.includes("undefined")) {
      return;
    } else {
      context.reply(
        "You uploaded a new bill. Let's go ahead and split the bill.",
      );
    }
    if (response) {
      const prompt = `You a split wise agent that splits the bill between the members of this group except for the sender.\n
      These are the users of the group: ${JSON.stringify(members?.map((member) => ({ ...member, username: `@${member.username}` })))}\n 
      This group app has many commands available: ${JSON.stringify(commands)}\n
      

      ## Instructions:
      When you receive the totals you should split the bill between the members of the group and send to each one a transaction frame
      - For the sake of this demo. Only send the payment to the sender not to all the other members.
      
      ### Return message
      Don't use markdown. Return messages in a json object The first message detailing the split. The second one you will send the command for the receiver to pay directly to the sender.
      Example:
      [ 
        {
          "message": "This are the details: Total: $49.52. Tip (20%): $9.90"
        },
        {
          "message": "All users owe X USDC to @${sender?.username}. Pay here:"
        },
        {
          "message": "/send @${sender?.username} $9.90"
        }
      ]
      `;

      const { reply: split } = await text(response, prompt);
      const splitMessages = JSON.parse(split);
      if (Array.isArray(splitMessages)) {
        for (const message of splitMessages) {
          //@ts-ignore
          const msg = message.message;
          if (msg.startsWith("/")) {
            context.handleCommand(msg);
          } else {
            await context.reply(msg);
          }
        }
      } else {
        await context.reply(split);
      }
    }
  }
}
