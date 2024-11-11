import { skills } from "../skills/skills_agent";
import { PROMPT_RULES, PROMPT_SKILLS_AND_EXAMPLES } from "../../helpers/gpt";
import {
  UserInfo,
  PROMPT_REPLACE_VARIABLES,
  PROMPT_USER_CONTENT,
} from "../../helpers/resolver";

export async function agent_prompt(userInfo: UserInfo) {
  let systemPrompt =
    PROMPT_RULES +
    PROMPT_USER_CONTENT(userInfo) +
    PROMPT_SKILLS_AND_EXAMPLES(skills, "@bot");

  // Replace the variables in the system prompt
  systemPrompt = PROMPT_REPLACE_VARIABLES(
    systemPrompt,
    userInfo?.address ?? "",
    userInfo,
    "@bot",
  );
  return systemPrompt;
}
