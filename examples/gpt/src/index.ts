import "dotenv/config";
import { run, HandlerContext } from "@xmtp/botkit";
import openaiCall from "./lib/gpt.js";

// Initialize an array to store the conversation history
const systemPrompt =
  "You are a helpful assistant that lives inside a web3 messaging app. You love blockchain and decentralization and you are quite funny. You often tell crypto jokes.";
let conversationHistory = [
  {
    role: "system",
    content: systemPrompt,
  },
];

run(async (context: HandlerContext) => {
  const { content, contentType, senderAddress } = context.message;
  const { typeId } = contentType;

  try {
    const { reply, messages } = await openaiCall(
      content,
      conversationHistory,
      senderAddress,
      systemPrompt,
    );
    conversationHistory = messages; // Update the conversation history
    await context.reply(reply as string);
  } catch (error) {
    // Handle the error, for example, by sending an error message to the user
    await context.reply(
      "Failed to process your request. Please try again later.",
    );
  }
});
