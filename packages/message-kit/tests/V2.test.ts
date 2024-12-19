import { describe, test, expect, vi, beforeEach } from "vitest";
import { MessageKit } from "../src/lib/core";
import { ContentTypeText } from "@xmtp/content-type-text";
import { ContentTypeReply } from "@xmtp/content-type-reply";
import { getMocks } from "./utils";
import { createClient } from "xmtp";

describe("Context Message Tests", () => {
  // Mock conversation data
  const {
    mockV2Conversation,
    mockV2Message,
    mockV2Client,
    mockV3Client,
    mockAgent,
  } = getMocks();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should send a text message", async () => {
    const context = await MessageKit.create(
      mockV2Conversation,
      mockV2Message,
      { client: mockV3Client, v2client: mockV2Client },
      mockAgent,
    );
    const xmtp = createClient();
    console.log(xmtp);

    expect(context).not.toBeUndefined();
    if (!context) return;

    await context.send("Test message");
    expect(mockV2Conversation.send).toHaveBeenCalledWith("Test message", {
      contentType: ContentTypeText,
    });
  });

  test("should send a reply", async () => {
    const context = await MessageKit.create(
      mockV2Conversation,
      mockV2Message,
      { client: mockV3Client, v2client: mockV2Client },
      mockAgent,
      "v2",
    );

    expect(context).not.toBeUndefined();
    if (!context) return;

    await context.reply("Reply message");
    expect(mockV2Conversation.send).toHaveBeenCalledWith(
      {
        content: "Reply message",
        contentType: ContentTypeText,
        reference: "msg-123",
      },
      { contentType: ContentTypeReply },
    );
  });

  test("should handle conversation key generation", async () => {
    const context = await MessageKit.create(
      mockV2Conversation,
      mockV2Message,
      { client: mockV3Client, v2client: mockV2Client },
      mockAgent,
      "v2",
    );

    expect(context).not.toBeUndefined();
    if (!context) return;

    const key = context.xmtp.getConversationKey();
    expect(key).toBe("test-topic");
  });
});
