import { XMTPContext, Skill } from "@xmtp/message-kit";

export const broadcast: Skill[] = [
  {
    skill: "/send",
    adminOnly: true,
    handler: handler,
    examples: ["/send Hello everyone, the event is starting now!"],
    description: "Send updates to all subscribers.",
    params: {
      message: {
        type: "prompt",
      },
    },
  },
];

async function handler(context: XMTPContext) {
  const {
    message: {
      content: { params },
      sender,
    },
  } = context;

  const fakeSubscribers = ["0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204"];
  if (fakeSubscribers.includes(sender.address)) {
    return await context.send("You are not authorized to send broadcasts.");
  }
  const { message } = params;
  console.log("Message", message);
  if (message.length < 100) {
    console.log("Message is too short", message.length);
    return {
      code: 400,
      message: "Message must be longer than 100 characters",
    };
  }
  return await context.sendTo(message, fakeSubscribers);
}
