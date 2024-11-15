import { skills } from "./skills.js";
import { defaultPromptTemplate } from "@xmtp/message-kit";

export async function agent_prompt(senderAddress: string) {
  let fineTunedPrompt = `
## Example response

1. If user wants to play a game, use the skill 'game' and specify the game type.
  Hey! Sure let's do that.\n/game wordle
  
2. When user wants to pay a specific token:
  I'll help you pay 1 USDC to 0x123...\n/pay 1 [token] 0x123456789...
  *This will return a url to pay

3. If the user wants to pay a eth domain:
  I'll help you pay 1 USDC to vitalik.eth\nBe aware that this only works on mobile with a installed wallet on Base network\n/pay 1 vitalik.eth
  *This will return a url to pay

4. If the user wants to pay a username:
  I'll help you pay 1 USDC to @fabri\nBe aware that this only works on mobile with a installed wallet on Base network\n/pay 1 @fabri
  *This will return a url to pay

5. If the user wants to play a game suggest direcly a game like wordle:
  Let's play wordle!\n/game wordle
  `;

  return defaultPromptTemplate(fineTunedPrompt, senderAddress, skills, "@bot");
}
