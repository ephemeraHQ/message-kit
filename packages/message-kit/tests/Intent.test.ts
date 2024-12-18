import { describe, test, expect, it, afterEach, afterAll } from "vitest";
import { agent } from "../../../templates/ens/src/index";
import { chatMemory, agentReply } from "../src/plugins/gpt";
import { Agent } from "../src/helpers/types";
import { Member } from "../src/helpers/types";
import { agentReplyMock } from "./utils";

const humanAgent: Member = {
  inboxId: "123",
  address: "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
  accountAddresses: ["0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204"],
  installationIds: ["123"],
};
const memoryKey = humanAgent.address;

describe("Flow Tests", async () => {
  afterEach(() => {
    console.log("chatMemory", chatMemory.getHistory(memoryKey).length);
  });
  afterAll(() => {
    console.log("chatMemory", chatMemory.getHistory(memoryKey));
  });
  test("Ask who holds vitalik.eth", async () => {
    let userPrompt = "who holds vitalik.eth";
    const mockReply = agentReplyMock(userPrompt, agent as Agent);
    // @ts-ignore
    const { reply } = await agentReply(mockReply);
    chatMemory.addEntry(mockReply.getMemoryKey(), reply, "assistant");
    expect(reply).toContain("/info vitalik.eth");
  });

  const prompts = [
    "Tip vitalik.eth",
    "again",
    "Tip vitalik.eth again",
    "Tip it again",
    "Tip it again",
    "Tip it again",
  ];

  for (let i = 0; i < prompts.length; i++) {
    test(
      `Step ${i + 1}: ${prompts[i]}`,
      {
        timeout: 10000,
      },
      async () => {
        let userPrompt = prompts[i];
        const mockReply = agentReplyMock(userPrompt, agent as Agent);
        // @ts-ignore
        const { reply } = await agentReply(mockReply);
        chatMemory.addEntry(mockReply.getMemoryKey(), reply, "assistant");
        expect(reply).toContain("/tip vitalik.eth");
      },
    );
  }
});
