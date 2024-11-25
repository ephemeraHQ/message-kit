import { clearInfoCache, clearMemory } from "@xmtp/message-kit";
import { XMTPContext } from "@xmtp/message-kit";

import type { Skill } from "@xmtp/message-kit";

export const registerSkill: Skill[] = [
  {
    skill: "/reset",
    examples: ["/reset"],
    handler: handler,
    description: "Reset the conversation clearing memory and usernames cache.",
    params: {},
  },
];
export async function handler(context: XMTPContext) {
  const {
    message: { sender },
  } = context;
  clearMemory(sender.address);
  clearInfoCache(sender.address);
  return { code: 200, message: "Memory and usernames cache cleared." };
}
