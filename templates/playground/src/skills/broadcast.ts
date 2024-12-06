import { XMTPContext, Skill } from "@xmtp/message-kit";

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

async function handler(context: XMTPContext) {
  const {
    message: {
      content: {
        params: { message },
      },
    },
  } = context;

  const fakeSubscribers = ["0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204"];
  await context.send("This is how your message will look like:");
  await context.send(message);
  const emailResponse = await context.awaitResponse(
    "Are you sure you want to send this broadcast?\nType 'yes' to confirm.",
    ["yes", "no"],
  );
  if (emailResponse === "yes") {
    await context.send("Sending broadcast...");
    await context.sendTo(message, fakeSubscribers);
    await context.send("Broadcast sent!");
  }
}
