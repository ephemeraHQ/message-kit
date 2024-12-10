import { describe, test, expect, vi, beforeEach } from "vitest";
import { XMTPContext } from "../src/lib/xmtp";
import { ContentTypeText } from "@xmtp/content-type-text";
import { ContentTypeReply } from "@xmtp/content-type-reply";
import { ContentTypeReaction } from "@xmtp/content-type-reaction";
import { getMocks } from "./utils";

describe("XMTPContext Message Tests", () => {
  // Mock conversation data
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

  test("should send a text message", async () => {
    const context = await XMTPContext.create(
      mockV2Conversation,
      mockV2Message,
      { client: mockV3Client, v2client: mockV2Client },
      mockAgent,
      "v2",
    );

    expect(context).not.toBeNull();
    if (!context) return;

    await context.send("Test message");
    expect(mockV2Conversation.send).toHaveBeenCalledWith("Test message", {
      contentType: ContentTypeText,
    });
  });

  test("should send a reply", async () => {
    const context = await XMTPContext.create(
      mockV2Conversation,
      mockV2Message,
      { client: mockV3Client, v2client: mockV2Client },
      mockAgent,
      "v2",
    );

    expect(context).not.toBeNull();
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

  test("should send a reaction", async () => {
    const context = await XMTPContext.create(
      mockV2Conversation,
      mockV2Message,
      { client: mockV3Client, v2client: mockV2Client },
      mockAgent,
      "v2",
    );

    expect(context).not.toBeNull();
    if (!context) return;

    await context.react("👍");
    expect(mockV2Conversation.send).toHaveBeenCalledWith(
      {
        action: "added",
        schema: "unicode",
        reference: "msg-123",
        content: "👍",
      },
      { contentType: ContentTypeReaction },
    );
  });

  test("should handle conversation key generation", async () => {
    const context = await XMTPContext.create(
      mockV2Conversation,
      mockV2Message,
      { client: mockV3Client, v2client: mockV2Client },
      mockAgent,
      "v2",
    );

    expect(context).not.toBeNull();
    if (!context) return;

    const key = context.getConversationKey();
    expect(key).toBe("test-topic:0x789");
  });
});
