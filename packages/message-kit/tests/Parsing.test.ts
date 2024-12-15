import { describe, test, expect } from "vitest";
import { parseSkill, findSkill } from "../src/lib/skills";
import { agent } from "../../../templates/ens/src/index";
import { fail } from "assert";
import { UserInfo } from "../src/plugins/resolver";

describe("Parsing tests", () => {
  test.each([
    ["/check vitalik.eth", "check", { domain: "vitalik.eth" }],
    ["/register vitalik.eth", "register", { domain: "vitalik.eth" }],
    ["/cool vitalik.eth", "cool", { domain: "vitalik.eth" }],
    ["/renew vitalik.eth", "renew", { domain: "vitalik.eth" }],
    ["/info vitalik.eth", "info", { domain: "vitalik.eth" }],
    [
      "/pay vitalik.eth",
      "pay",
      {
        username: {
          ensDomain: "vitalik.eth",
        },
        amount: 10,
        token: "usdc",
        address: "",
      },
    ],
  ])(
    "Compare extracted values from skill: %s",
    async (input, expectedSkill, expectedParams) => {
      // @ts-ignore
      const skillAction = findSkill(input, agent?.skills);
      if (skillAction) {
        const extractedValues = await parseSkill(input, skillAction);
        expect(extractedValues?.skill).toBe(expectedSkill);

        // Specific check for the username property, only for the last case
        if (input === "/pay vitalik.eth") {
          console.log(
            (extractedValues?.params?.username as UserInfo)?.ensDomain,
          );
          expect(
            (extractedValues?.params?.username as UserInfo)?.ensDomain,
          ).toEqual("vitalik.eth");
        } else {
          expect(extractedValues?.params).toEqual(expectedParams);
        }
      } else {
        fail(`No skill found for input: ${input}`);
      }
    },
  );
});
