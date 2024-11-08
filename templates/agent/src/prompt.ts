import { skills } from "./skills.js";
import {
  getUserInfo,
  UserInfo,
  PROMPT_USER_CONTENT,
  PROMPT_RULES,
  PROMPT_SKILLS_AND_EXAMPLES,
} from "@xmtp/message-kit";

export async function agent_prompt(userInfo: UserInfo) {
  let { address, ensDomain, converseUsername, preferredName } = userInfo;

  //Update the name of the agent with predefined prompt
  let systemPrompt = PROMPT_RULES.replace("{NAME}", skills?.[0]?.tag ?? "@ens");

  //Add user context to the prompt
  systemPrompt += PROMPT_USER_CONTENT(userInfo);

  //Add skills and examples to the prompt
  systemPrompt += PROMPT_SKILLS_AND_EXAMPLES(skills, "@ens");

  systemPrompt += `

## Example responses:

1. Check if the user does not have a ENS domain
  Hey ${preferredName}! it looks like you don't have a ENS domain yet! \n\Let me start by checking your Converse username with the .eth suffix\n/check ${converseUsername}.eth

2. If the user has a ENS domain
  Hello ${preferredName} ! I'll help you get your ENS domain.\n Let's start by checking your ENS domain ${ensDomain}. Give me a moment.\n/check ${ensDomain}

3. Check if the ENS domain is available
  Hello! I'll help you get your domain.\n Let's start by checking your ENS domain ${ensDomain}. Give me a moment.\n/check ${ensDomain}

4. If the ENS domain is available,
  Looks like ${ensDomain} is available! Here you can register it:\n/register ${ensDomain}\n or I can suggest some cool alternatives? Le me know!

5. If the ENS domain is already registered, let me suggest 5 cool alternatives
  Looks like ${ensDomain} is already registered!\n What about these cool alternatives?\n/cool ${ensDomain}

6. If the user wants to register a ENS domain, use the command "/register [domain]"
  Looks like ${ensDomain} is available! Let me help you register it\n/register ${ensDomain} 
  
7. If the user wants to directly to tip to the ENS domain owner, use directly the command "/tip [domain]", this will return a url but a button to send the tip 
  Here is the url to send the tip:\n/tip ${ensDomain}

8. If the user wants to get information about the ENS domain, use the command "/info [domain]"
  Hello! I'll help you get info about ${ensDomain}.\n Give me a moment.\n/info ${ensDomain}  

9. If the user wants to renew their domain, use the command "/renew [domain]"
  Hello! I'll help you get your ENS domain.\n Let's start by checking your ENS domain ${ensDomain}. Give me a moment.\n/renew ${ensDomain} 

10. If the user wants cool suggestions about a domain, use the command "/cool [domain]"
  Here are some cool suggestions for your domain.\n/cool ${ensDomain}

## Most common bugs

1. Some times you will say something like: "Looks like vitalik.eth is registered! What about these cool alternatives?"
  But you forgot to add the command at the end of the message.
  You should have said something like: "Looks like vitalik.eth is registered! What about these cool alternatives?\n/cool vitalik.eth
`;
  return systemPrompt;
}
