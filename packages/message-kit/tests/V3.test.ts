import { describe, test, expect, vi, beforeEach } from "vitest";
import { MessageKit } from "../src/lib/core";
import { ContentTypeText } from "@xmtp/content-type-text";
import { getMocks } from "./utils";

describe("Context Message Tests", () => {
  const {
    mockV2Conversation,
    mockV2Message,
    mockV3Conversation,
    mockV3Message,
    mockV2Client,
    mockV3Client,
    mockAgent,
  } = getMocks();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should send a message to a V3 group chat and receive it by all members", async () => {
    const context = await MessageKit.create(
      mockV3Conversation,
      mockV3Message,
      { client: mockV3Client, v2client: mockV2Client },
      mockAgent,
      "v3",
    );

    expect(context).not.toBeUndefined();
    if (!context) return;

    await context.send("Group message");
    expect(mockV3Conversation.send).toHaveBeenCalledWith(
      "Group message",
      ContentTypeText,
    );
    // Simulate receiving the message by all members
    const members = await mockV3Conversation.members();
    for (const member of members) {
      // @ts-ignore
      const messages = await member?.client?.messages(); // Fetch messages for each member
      console.log(messages);
      expect(messages).toContain("Group message");
    }
  });
});
