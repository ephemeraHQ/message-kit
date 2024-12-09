import { describe } from "vitest";
import { agent } from "../../../templates/ens/src/index";
import { systemPrompt as ensSystemPrompt } from "../../../templates/ens/src/prompt";
import { testPrompt } from "./utils";
const humanAgent = {
  address: "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
  converseUsername: "humanagent",
};

const alix = {
  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  converseUsername: "alix",
};
type testCase = [string, string | string[]][];

describe("ENS tests", () => {
  const testCases: testCase = [
    ["hi", "Fabri"],
    ["I want to get info for vitalik.eth", "/info vitalik.eth"],
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
      "pay vitalik.eth",
      [
        "/pay vitalik.eth",
        "/info vitalik.eth",
        "/pay 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "/pay",
      ],
    ],
  ];
  testPrompt(testCases, agent, ensSystemPrompt, humanAgent);
}, 15000);
