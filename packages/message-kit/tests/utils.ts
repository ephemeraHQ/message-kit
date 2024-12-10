import { describe, test, expect, vi, beforeEach } from "vitest";
import { Agent } from "../src/helpers/types";
import { clearMemory, replaceVariables, agentParse } from "../src/helpers/gpt";
import { clearInfoCache } from "../src/helpers/resolver";
import { ContentTypeText } from "@xmtp/content-type-text";
import {
  Client as V2Client,
  Conversation as V2Conversation,
  DecodedMessage as V2DecodedMessage,
} from "@xmtp/xmtp-js";
import {
  Client as V3Client,
  Conversation as V3Conversation,
  DecodedMessage as V3DecodedMessage,
} from "@xmtp/node-sdk";

export function testPrompt(
  testCases: [string, string | string[]][],
  agent: Agent,
  systemPrompt: string,
  sender: { address: string; converseUsername: string },
) {
  clearMemory();
  clearInfoCache();
  test.each(testCases)(
    "should handle %s correctly",
    async (userPrompt, expectedPatterns) => {
      let prompt = await replaceVariables(systemPrompt, sender.address, agent);
      const reply = await agentParse(
        userPrompt as string,
        sender.address,
        prompt,
      );
      let matches = false;
      if (Array.isArray(expectedPatterns)) {
        matches = expectedPatterns.some((pattern) =>
          reply?.toLowerCase().includes(pattern.toLowerCase()),
        );
      } else {
        matches =
          reply?.toLowerCase().includes(expectedPatterns.toLowerCase()) ??
          false;
      }

      if (matches !== true) {
        console.log("userPrompt", userPrompt);
        console.log("reply", reply);
        console.log("expectedPatterns", expectedPatterns);
        console.log("matches", matches);
      }
      expect(matches).toBe(true);
    },
  );
}

export function getMocks() {
  const mockV2Conversation = {
    topic: "test-topic",
    send: vi.fn().mockResolvedValue(undefined),
    peerAddress: "0x123",
    messages: vi.fn().mockResolvedValue([]),
    messagesPaginated: vi.fn(),
    streamMessages: vi.fn(),
    streamAllMessages: vi.fn(),
  } as unknown as V2Conversation;

  // Updated mock V2 client with proper mock methods
  const mockV2Client = {
    address: "0x456",
    conversations: {
      list: vi.fn().mockResolvedValue([mockV2Conversation]),
      newConversation: vi.fn().mockImplementation(async () => ({
        ...mockV2Conversation,
        send: vi.fn().mockResolvedValue(undefined),
      })),
      client: {} as any,
    },
  } as unknown as V2Client;

  const mockV3Conversation = {
    id: "test-id",
    send: vi.fn().mockResolvedValue(undefined),
    sync: vi.fn().mockResolvedValue(undefined),
    addMembers: vi.fn().mockResolvedValue(undefined),
    addMembersByInboxId: vi.fn().mockResolvedValue(undefined),

    client: {
      messages: vi.fn().mockResolvedValue(["Group message"]),
    },
    admins: [],
    superAdmins: [],
    createdAt: new Date(),
  } as unknown as V3Conversation;

  const mockV3Client = {
    inboxId: "test-inbox",
    conversations: {
      getMessageById: vi.fn().mockResolvedValue(undefined),
      getConversationById: vi.fn().mockResolvedValue(mockV3Conversation),
      list: vi.fn().mockResolvedValue([mockV3Conversation]),
    },
    messages: vi.fn().mockResolvedValue(["Group message"]),
  } as unknown as V3Client;

  const mockV2Message = {
    id: "msg-123",
    content: "Hello world",
    contentType: ContentTypeText,
    senderAddress: "0x789",
    sent: new Date(),
    conversation: mockV2Conversation,
  } as unknown as V2DecodedMessage;

  const mockV3Message = {
    id: "msg-123",
    content: "Hello world",
    contentType: ContentTypeText,
    senderInboxId: "sender-inbox",
    sent: new Date(),
    conversationId: "test-id",
    kind: "text",
  } as unknown as V3DecodedMessage;

  mockV3Conversation.members = vi.fn().mockResolvedValue([
    {
      inboxId: "member1-inbox",
      address: "0x111",
      accountAddresses: [],
      installationIds: [],
      client: mockV3Client as any,
    },
  ]);
  return {
    mockV2Conversation,
    mockV2Message,
    mockV3Conversation,
    mockV3Message,
    mockV2Client,
    mockV3Client,
  };
}
