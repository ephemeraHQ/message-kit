import { describe, test, expect, vi, beforeEach } from "vitest";
import { XMTPContext } from "../src/lib/xmtp";
import { ContentTypeText } from "@xmtp/content-type-text";
import { getMocks } from "./utils";

describe("XMTPContext Message Tests", () => {
  let { mockV3Conversation, mockV3Message, mockV2Client, mockV3Client } =
    getMocks();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should send a message to a V3 group chat and receive it by all members", async () => {
    const context = await XMTPContext.create(
      mockV3Conversation,
      mockV3Message,
      { client: mockV3Client, v2client: mockV2Client },
      {},
      "v3",
    );

    expect(context).not.toBeNull();
    if (!context) return;

    await context.send("Group message");
    expect(mockV3Conversation.send).toHaveBeenCalledWith(
      "Group message",
      ContentTypeText,
    );
    // Simulate receiving the message by all members
    const members = await mockV3Conversation.members();
    for (const member of members) {
      const messages = await member?.client?.messages(); // Fetch messages for each member
      console.log(messages);
      expect(messages).toContain("Group message");
    }
  });
});
