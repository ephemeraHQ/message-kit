import { HandlerContext } from "@xmtp/message-kit";
import { textGeneration } from "../lib/gpt.js";
import { vision } from "../lib/vision.js";
import { getUserInfo } from "../lib/resolver.js";

export async function handler(context: HandlerContext) {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.warn("No OPEN_AI_API_KEY found in .env");
    return;
  }
  const {
    members,
    skill,
    message: {
      typeId,
      content: { attachment },
      sender,
    },
  } = context;

  if (!members) {
    return;
  }
  let senderInfo = await getUserInfo(sender.address);
  if (attachment && typeId === "remoteStaticAttachment") {
    const { data } = attachment;
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

      ## Instructions:
      When you receive the totals you should split the bill between the members of the group and send to each one a transaction frame
      - For the sake of this demo. Only send the payment to the sender not to all the other members.
      
      ### Return message
      Don't use markdown. Return messages in a json object The first message detailing the split. The second one you will send the command for the receiver to pay directly to the sender.
      Example:
      [  
        "This are the details: Total: $49.52. Tip (20%): $9.90",
        "All users owe X USDC to @${senderInfo?.converseUsername}. Pay here:",
        "/send @${senderInfo?.converseUsername} $9.90"
      ]
      `;

      //I want the reply to be an array of messages so the bot feels like is sending multuple ones
      const { reply } = await textGeneration(sender.address, response, prompt);
      let splitMessages = JSON.parse(reply);
      for (const message of splitMessages) {
        let msg = message as string;
        if (msg.startsWith("/")) await skill(msg);
        else await context.send(msg);
      }
    }
  }
}
