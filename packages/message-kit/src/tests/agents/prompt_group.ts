import { skills } from "../skills/skills_group";
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

  // Replace the variables in the system prompt
  systemPrompt = PROMPT_REPLACE_VARIABLES(
    systemPrompt,
    userInfo?.address ?? "",
    userInfo,
    "@bot",
  );
  return systemPrompt;
}
