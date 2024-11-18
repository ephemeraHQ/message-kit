import { clearInfoCache, clearMemory } from "@xmtp/message-kit";
import { XMTPContext } from "@xmtp/message-kit";

export async function handleReset(context: XMTPContext) {
  clearMemory();
  clearInfoCache();
  return { code: 200, message: "Conversation reset." };
}
