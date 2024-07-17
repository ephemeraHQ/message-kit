import { jest } from "@jest/globals";
import HandlerContext from "./handlerContext";

const mockIntent = jest.fn().mockImplementation(async (messages, options) => {
  let splitMessages = [messages];
  const { conversation, receivers } = options ?? {};
  try {
    if (Array.isArray(JSON.parse(messages)))
      splitMessages = JSON.parse(messages);
    if (process?.env?.MSG_LOG === "true") {
      console.log("splitMessages", splitMessages);
    }
  } catch (e) {}

  for (const message of splitMessages) {
    const msg = message as string;
    if (msg.startsWith("/")) {
      await HandlerContext.prototype.handleCommand(msg, {
        conversation,
        receivers,
      });
    } else {
      await HandlerContext.prototype.reply(msg, { conversation, receivers });
    }
  }
});

// Usage in your tests
test("should handle intent correctly", async () => {
  const context = new HandlerContext(/* constructor parameters */);
  context.intent = mockIntent;

  await context.intent("test message", { conversation: {}, receivers: [] });

  expect(mockIntent).toHaveBeenCalled();
});
