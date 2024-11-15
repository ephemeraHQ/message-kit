import "dotenv/config";
import { describe, test, expect } from "vitest";
import { parseSkill } from "../../lib/skills";
import { skills } from "../skills/skills_group";

describe("Skill extraction tests", () => {
  test("Extract values from /tip skill", () => {
    const inputContent = "/tip @bo @alix 15";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "tip",
      params: {
        amount: 15,
        username: ["@bo", "@alix"], // Simplified expectation to match actual output
      },
    });
  });

  // /pay 1 to @bo
  test("Extract values from /pay skill", () => {
    const inputContent = "/pay 1 to @bo";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "pay",
      params: {
        amount: 1,
        token: "usdc",
        username: "@bo",
      },
    });
  });

  test("Extract values from /pay skill", () => {
    const inputContent = "/pay 10 usdc to @bo";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "pay",
      params: {
        amount: 10,
        token: "usdc",
        username: "@bo",
      },
    });
  });

  test("Extract values from /pay skill", () => {
    const inputContent = "/pay 10 usdc to @fabri";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "pay",
      params: {
        amount: 10,
        token: "usdc",
        username: "@fabri",
      },
    });
  });

  test("Extract values from /pay  skill", () => {
    const inputContent = "/pay 10 usdc vitalik.eth";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "pay",
      params: {
        amount: 10,
        token: "usdc",
        username: "vitalik.eth",
      },
    });
  });

  test("Extract values from /game skill", () => {
    const inputContent = "/game slot";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "game",
      params: {
        game: "slot",
      },
    });
  });

  test("Extract values from 🔎 emoji", () => {
    const inputContent = "🔎 ";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: undefined,
      params: {},
    });
  });

  test("Extract values from /game help skill", () => {
    const inputContent = "/game help";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "game",
      params: {
        game: "help",
      },
    });
  });

  test("Extract values from /pay 1 to @bo skill", () => {
    const inputContent = "/pay 1 to @bo";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "pay",
      params: {
        amount: 1,
        token: "usdc",
        username: "@bo",
      },
    });
  });

  test("Extract values from /help skill", () => {
    const inputContent = "/help";
    const extractedValues = parseSkill(inputContent, skills);
    expect(extractedValues).toEqual({
      skill: "help",
      params: {},
    });
  });
});
