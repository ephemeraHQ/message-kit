import { defaultPromptTemplate } from "@xmtp/message-kit";

export async function agent_prompt(senderAddress: string) {
  
  return defaultPromptTemplate(fineTunedPrompt, senderAddress, [], "@bot");
}
