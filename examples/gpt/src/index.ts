import "dotenv/config";
import { run, HandlerContext } from "@xmtp/botkit";
import openaiCall from "./lib/gpt.js";

run(async (context: HandlerContext) => {
  const { content, typeId, senderAddress } = context.message;
  const { content: text } = content;

  // Initialize an array to store the conversation history
  const systemPrompt =
    "You are a helpful assistant that lives inside a web3 messaging app. You love blockchain and decentralization and you are quite funny. You often tell crypto jokes.";

  try {
    let { reply } = await openaiCall(text, senderAddress, systemPrompt);

    await context.textReply(`${reply}`);
  } catch (error) {
    // Handle the error, for example, by sending an error message to the user
    await context.textReply(
      "Failed to process your request. Please try again later.",
    );
  }
});
