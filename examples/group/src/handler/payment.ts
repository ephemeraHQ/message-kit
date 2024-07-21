import { HandlerContext } from "@xmtp/message-kit";
import { vision, textGeneration } from "../lib/openai.js";

export async function handler(context: HandlerContext) {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in .env");
    return;
  }
  const {
    members,
    commands,
    message: {
      typeId,
      content: { attachment },
      sender,
    },
  } = context;

  if (attachment && typeId === "remoteStaticAttachment") {
    const { data, filename, mimeType } = attachment;
    const response = await vision(
      data,
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
      const prompt = `You a split wise agent that splits the bill between the members of this group except for the sender and bot.\n
      These are the users of the group: ${JSON.stringify(members?.map((member) => ({ ...member, username: `@${member.username}` })))}\n 
      This group app has many commands available: ${JSON.stringify(commands)}\n
      

      ## Instructions:
      When you receive the totals you should split the bill between the members of the group and send to each one a transaction frame
      - For the sake of this demo. Only send the payment to the sender not to all the other members.
      
      ### Return message
      Don't use markdown. Return messages in a json object The first message detailing the split. The second one you will send the command for the receiver to pay directly to the sender.
      Example:
      [  
        "This are the details: Total: $49.52. Tip (20%): $9.90",
        "All users owe X USDC to @${sender?.username}. Pay here:",
        "/send @${sender?.username} $9.90"
      ]
      `;

      //I want the reply to be an array of messages so the bot feels like is sending multuple ones
      const { reply } = await textGeneration(response, prompt);
      let splitMessages = JSON.parse(reply);
      for (const message of splitMessages) {
        let msg = message as string;
        if (msg.startsWith("/")) await context.intent(msg);
        else await context.reply(msg);
      }
    }
  }
}
