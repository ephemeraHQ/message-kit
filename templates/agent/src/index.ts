import { run, HandlerContext } from "@xmtp/message-kit";
import { textGeneration, processMultilineResponse } from "@xmtp/message-kit";
import { agent_prompt } from "./prompt.js";

run(async (context: HandlerContext) => {
  const {
    message: {
      content: { text, params },
      sender,
    },
  } = context;

  try {
    let userPrompt = params?.prompt ?? text;

    const { reply } = await textGeneration(
      sender.address,
      userPrompt,
      await agent_prompt(sender.address),
    );
    await processMultilineResponse(sender.address, reply, context);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.send("An error occurred while processing your request.");
  }
});
