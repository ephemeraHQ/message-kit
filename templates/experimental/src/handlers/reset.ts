import { clearInfoCache, clearMemory } from "@xmtp/message-kit";
import { XMTPContext } from "@xmtp/message-kit";

import type { Skill } from "@xmtp/message-kit";

export const registerSkill: Skill[] = [
  {
    skill: "/reset",
    examples: ["/reset"],
    handler: handler,
    description: "Reset the conversation.",
    params: {},
  },
];
export async function handler(context: XMTPContext) {
  clearMemory();
  clearInfoCache();
  return { code: 200, message: "Conversation reset." };
}
