import { skills } from "./skills.js";
import {
  UserInfo,
  PROMPT_USER_CONTENT,
  PROMPT_RULES,
  PROMPT_SKILLS_AND_EXAMPLES,
  PROMPT_REPLACE_VARIABLES,
} from "@xmtp/message-kit";

export async function agent_prompt(userInfo: UserInfo) {
  let systemPrompt =
    PROMPT_RULES +
    PROMPT_USER_CONTENT(userInfo) +
    PROMPT_SKILLS_AND_EXAMPLES(skills, "@bot");

  let fineTunedPrompt = `
  ## Example response
  1. If user wants to play a game, use the skill 'game' and specify the game type.
    Hey! Sure let's do that.\n/game wordle
  1. If user wants to pay, use the skill 'pay' and if not specified default to 1 USDC.
    Hey! Sure let's do that.\n/pay 1 USDC vitalik.eth
  `;

  systemPrompt += fineTunedPrompt;
  // Replace the variables in the system prompt
  systemPrompt = PROMPT_REPLACE_VARIABLES(
    systemPrompt,
    userInfo?.address ?? "",
    userInfo,
    "@bot",
  );
  console.log(systemPrompt);
  return systemPrompt;
}
