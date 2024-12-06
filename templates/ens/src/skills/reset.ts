import { clearInfoCache, clearMemory } from "@xmtp/message-kit";
import { XMTPContext } from "@xmtp/message-kit";

import type { Skill } from "@xmtp/message-kit";

export const reset: Skill[] = [
  {
    skill: "reset",
    examples: ["/reset"],
    handler: handler,
    description: "Reset the conversation clearing memory and usernames cache.",
  },
];
export async function handler(context: XMTPContext) {
  const {
    message: { sender },
  } = context;
  try {
    clearMemory(sender.address);
    clearInfoCache(sender.address);
    return { code: 200, message: "Memory and usernames cache cleared." };
  } catch (error) {
    return { code: 500, message: "Error clearing memory and usernames cache." };
  }
}
