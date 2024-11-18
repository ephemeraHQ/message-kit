import { clearMemory } from "@xmtp/message-kit";
import { XMTPContext } from "@xmtp/message-kit";

export async function handleReset(context: XMTPContext) {
  clearMemory();
  const message = "Conversation has been reset.";
  context.send(message);
  return { code: 200, message };
}
