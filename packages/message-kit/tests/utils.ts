import { vi } from "vitest";
import { Agent } from "../src/helpers/types";
import { Message, Conversation, User } from "xmtp";

// Define mocks at the top level
const mockConversation: Conversation = {
  id: "conv-123",
  topic: "test-topic",
  createdAt: new Date(),
  members: [],
  admins: [],
  superAdmins: [],
};

const humanAgent: User = {
  inboxId: "123",
  address: "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
  accountAddresses: ["0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204"],
  installationIds: ["123"],
};

const mockMessage: Message = {
  id: "msg-123",
  content: {
    text: "Hello world",
    params: {},
  },

  version: "v2",
  sent: new Date(),
  conversation: mockConversation,
  sender: humanAgent,
};

export const agentReplyMock = (userPrompt: string, agent: Agent) => {
  return {
    message: {
      content: { text: userPrompt, params: {} },
      sender: humanAgent,
    },
    agent: agent as Agent,
    getMemoryKey: () => humanAgent.address,
    send: async (response: string) => {},
    executeSkill: async (message: string) => {
      return {
        code: 200,
        message: "Mocked skill response",
      };
    },
  };
};

export function getMocks() {
  // Mock client can be defined here if needed
  const mockClient = {
    address: "0x123",
    conversations: {
      list: vi.fn().mockResolvedValue([mockConversation]),
    },
  };

  mockConversation.members = [
    {
      inboxId: "member1-inbox",
      address: "0x111",
      accountAddresses: [],
      installationIds: [],
    },
  ];

  const mockAgent = {
    name: "test-agent",
    description: "test-agent",
    tag: "test-agent",
  } as Agent;

  return {
    mockConversation,
    mockMessage,
    mockAgent,
  };
}
