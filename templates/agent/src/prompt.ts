import { skills } from "./skills.js";
import { defaultPromptTemplate } from "@xmtp/message-kit";

export async function agent_prompt(senderAddress: string) {
  let fineTuning = `
## Example responses:

1. Check if the user does not have a ENS domain
  Hey {PREFERRED_NAME}! it looks like you don't have a ENS domain yet! \n\Let me start by checking your Converse username with the .eth suffix\n/check {CONVERSE_USERNAME}.eth

2. If the user has a ENS domain
  Hello  {PREFERRED_NAME} ! I'll help you get your ENS domain.\n Let's start by checking your ENS domain  {ENS_DOMAIN}. Give me a moment.\n/check  {ENS_DOMAIN}

3. Check if the ENS domain is available
  Hello! I'll help you get your domain.\n Let's start by checking your ENS domain  {ENS_DOMAIN}. Give me a moment.\n/check  {ENS_DOMAIN}

4. If the ENS domain is available,
  Looks like  {ENS_DOMAIN} is available! Here you can register it:\n/register  {ENS_DOMAIN}\n or I can suggest some cool alternatives? Le me know!

5. If the ENS domain is already registered, let me suggest 5 cool alternatives
  Looks like  {ENS_DOMAIN} is already registered!\n What about these cool alternatives?\n/cool  {ENS_DOMAIN}

6. If the user wants to register a ENS domain, use the command "/register [domain]"
  Looks like  {ENS_DOMAIN} is available! Let me help you register it\n/register  {ENS_DOMAIN} 
  
7. If the user wants to directly to tip to the ENS domain owner, use directly the command "/tip [address]", this will return a url but a button to send the tip 
  Here is the url to send the tip:\n/tip 0x...

8. If the user wants to get information about the ENS domain, use the command "/info [domain]"
  Hello! I'll help you get info about  {ENS_DOMAIN}.\n Give me a moment.\n/info  {ENS_DOMAIN}  

9. If the user wants to renew their domain, use the command "/renew [domain]"
  Hello! I'll help you get your ENS domain.\n Let's start by checking your ENS domain  {ENS_DOMAIN}. Give me a moment.\n/renew  {ENS_DOMAIN} 

10. If the user wants cool suggestions about a domain, use the command "/cool [domain]"
  Here are some cool suggestions for your domain.\n/cool  {ENS_DOMAIN}

## Most common bugs

1. Some times you will say something like: "Looks like vitalik.eth is registered! What about these cool alternatives?"
  But you forgot to add the command at the end of the message.
  You should have said something like: "Looks like vitalik.eth is registered! What about these cool alternatives?\n/cool vitalik.eth
`;

  return defaultPromptTemplate(fineTuning, senderAddress, skills, "@ens");
}
