import { describe, test, expect, it, afterEach, afterAll } from "vitest";
import { agent } from "../../../templates/ens/src/index";
import { chatMemory, agentReply } from "../src/plugins/gpt";
import { Agent } from "../src/helpers/types";
import { AbstractedMember } from "../src/helpers/types";

const humanAgent: AbstractedMember = {
  inboxId: "123",
  address: "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
  accountAddresses: ["0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204"],
  installationIds: ["123"],
};
const memoryKey = humanAgent.address;

type testCase = [string, string[]][];

describe("Flow Tests", async () => {
  afterEach(() => {
    console.log("chatMemory", chatMemory.getHistory(memoryKey).length);
  });
  afterAll(() => {
    console.log("chatMemory", chatMemory.getHistory(memoryKey));
  });
  test("Ask who holds vitalik.eth", async () => {
    let prompt = "who holds vitalik.eth";
    const { reply } = await agentReply({
      // @ts-ignore
      message: {
        content: { text: prompt, params: {} },
        sender: humanAgent,
      },
      agent: agent as Agent,
      send: async () => {},
      getMemoryKey: () => memoryKey,
      executeSkill: async () => ({
        code: 200,
        message: "Mocked skill response",
      }),
    });
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
        let prompt = prompts[i];
        const { reply } = await agentReply({
          // @ts-ignore
          message: {
            content: { text: prompt, params: {} },
            sender: humanAgent,
          },
          agent: agent as Agent,
          send: async () => {},
          getMemoryKey: () => memoryKey,
          executeSkill: async () => ({
            code: 200,
            message: "Mocked skill response",
          }),
        });
        expect(reply).toContain("/tip vitalik.eth");
      },
    );
  }
});

describe("Prompting", async () => {
  const testCases: testCase = [
    ["hi", ["Fabri", "humanagent"]],
    ["I want to get info for vitalik.eth", ["/info vitalik.eth"]],
    [
      "renew my domain",
      [
        "/check fabri.eth",
        "/check humanagent.eth",
        "/renew humanagent.eth",
        "/renew fabri.eth",
        "/renew fabri.base.eth",
      ],
    ],
    [
      "domain info for humanagent.eth",
      ["/info humanagent.eth", "/check humanagent.eth"],
    ],
    [
      "pay vitalik.eth 1 usdc",
      [
        "/pay vitalik.eth",
        "/info vitalik.eth",
        "vitalik.eth",
        "/pay 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 1",
      ],
    ],
  ];

  testCases.forEach(([userPrompt, expectedResponses]) => {
    it(`should handle prompt: "${userPrompt}"`, async () => {
      const { reply } = await agentReply({
        // @ts-ignore
        message: {
          content: { text: userPrompt, params: {} },
          sender: humanAgent,
        },
        agent: agent as Agent,
        send: async () => {},
        getMemoryKey: () => memoryKey,
        executeSkill: async () => ({
          code: 200,
          message: "Mocked skill response",
        }),
      });
      expect(expectedResponses.some((response) => response.includes(reply)));
    });
  });
}, 15000);
