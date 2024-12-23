import { Context, Skill } from "@xmtp/message-kit";

export const broadcast: Skill[] = [
  {
    skill: "send",
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

async function handler(context: Context) {
  const {
    message: {
      content: {
        params: { message },
      },
    },
  } = context;

  const fakeSubscribers = ["0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204"];
  await context.send({
    message: "This is how your message will look like:",
    originalMessage: context.message,
  });
  await context.send({
    message: message,
    originalMessage: context.message,
    typeId: "reply",
  });
  const emailResponse = await context.awaitResponse(
    "Are you sure you want to send this broadcast?\nType 'yes' to confirm.",
    ["yes", "no"],
  );
  if (emailResponse === "yes") {
    await context.send({
      message: "Sending broadcast...",
      originalMessage: context.message,
      typeId: "reply",
    });
    await context.send({
      message: message,
      receivers: fakeSubscribers,
      originalMessage: context.message,
    });
    await context.send({
      message: "Broadcast sent!",
      originalMessage: context.message,
      typeId: "reply",
    });
  }
}
