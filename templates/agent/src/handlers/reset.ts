import { clearInfoCache, clearMemory } from "@xmtp/message-kit";
import { XMTPContext } from "@xmtp/message-kit";

import type { skillAction } from "@xmtp/message-kit";

export const registerSkill: skillAction[] = [
  {
    skill: "/reset",
    examples: ["/reset"],
    handler: handleReset,
    description: "Reset the conversation.",
    params: {},
  },
];
export async function handleReset(context: XMTPContext) {
  clearMemory();
  clearInfoCache();
  return { code: 200, message: "Conversation reset." };
}
