import { run, HandlerContext } from "@xmtp/message-kit";
import { textGeneration, processMultilineResponse } from "./lib/openai.js";
import { agent_prompt } from "./prompt.js";
import { getUserInfo } from "./lib/resolver.js";

run(async (context: HandlerContext) => {
  /*All the skills are handled through the skills file*/
  /* If its just text, it will be handled by the ensAgent*/
  /* If its a group message, it will be handled by the groupAgent*/
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.warn("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: {
      content: { content, params },
      sender,
    },
  } = context;

  try {
    let userPrompt = params?.prompt ?? content;
    const userInfo = await getUserInfo(sender.address);
    if (!userInfo) {
      console.log("User info not found");
      return;
    }
    const { reply } = await textGeneration(
      sender.address,
      userPrompt,
      await agent_prompt(userInfo),
    );
    await processMultilineResponse(sender.address, reply, context);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.send("An error occurred while processing your request.");
  }
});
