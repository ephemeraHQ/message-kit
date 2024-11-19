import { describe } from "vitest";
import { skills as ensSkills } from "../../../../templates/agent/src/";
import { systemPrompt as ensSystemPrompt } from "../../../../templates/agent/src/prompt";
import { skills as groupSkills } from "../../../../templates/group/src/index";
import { systemPrompt as groupSystemPrompt } from "../../../../templates/group/src/prompt";
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

describe("Prompting tests", () => {
  const testCases: testCase = [
    ["hi", "Fabri"],
    ["I want to get info for vitalik.eth", "/info vitalik.eth"],
    [
      "renew my domain",
      [
        "/check fabri.eth",
        "/check humanagent.eth",
        "/renew humanagent.eth",
        "/renew fabri.base.eth",
      ],
    ],
    [
      "domain info for humanagent.eth",
      ["/info humanagent.eth", "/check humanagent.eth"],
    ],
    [
      "tip vitalik.eth",
      [
        "/tip vitalik.eth",
        "/info vitalik.eth",
        "/tip 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "/tip",
      ],
    ],
  ];
  testPrompt(testCases, ensSkills, ensSystemPrompt, "@ens", humanAgent);
}, 15000);

describe("Prompting tests", () => {
  const testCases: testCase = [
    ["@bot let's play a game", "/game wordle"],
    ["@bot let's tip @alix 10 usdc", ["/tip @alix 10 usdc"]],
  ];
  testPrompt(testCases, groupSkills, groupSystemPrompt, "@bot", alix);
}, 15000); // Added 15 second timeout
