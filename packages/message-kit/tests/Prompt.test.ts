import { describe, test, expect, it, afterEach, afterAll } from "vitest";
import { chatMemory, agentReply } from "../src/plugins/gpt";
import { agentReplyMock } from "./utils";
import { Agent } from "../src/helpers/types";
import { agent } from "../../../templates/ens/src";

type testCase = [string, string[]][];

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
      const mockReply = agentReplyMock(userPrompt, agent as Agent);
      // @ts-ignore
      const { reply } = await agentReply(mockReply);
      chatMemory.addEntry(mockReply.getMemoryKey(), reply, "assistant");
      expect(expectedResponses.some((response) => response.includes(reply)));
    });
  });
}, 15000);
