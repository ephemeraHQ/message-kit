import { run, HandlerContext } from "@xmtp/message-kit";
import { ChatOpenAI } from "@langchain/openai";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import { tools } from "./skills.js";
import { systemPrompt } from "./prompt.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Initialize OpenAI chat model
const model = new ChatOpenAI({
  temperature: 0.7,
  modelName: "gpt-4o-mini",
});

// Create the prompt template with required variables
const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
]).partial({
  tools: tools.map(tool => `${tool.name}: ${tool.description}`).join('\n'),
  tool_names: tools.map(tool => tool.name).join(', ')
});

// Initialize chat history storage
const chatHistory = new Map<string, { role: string; content: string }[]>();

// Initialize the agent and executor
const initializeAgent = async () => {
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt: await prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
    returnIntermediateSteps: false,
    verbose: true, // Set to true for checking the agent's thought process
  });
};

// Create executor instance
const executor = await initializeAgent();

run(async (context: HandlerContext) => {
  const {
    message: {
      content: { text },
      sender,
    },
  } = context;

  console.log("Received message:", text);

  // Get or initialize chat history for this sender
  if (!chatHistory.has(sender.address)) {
    chatHistory.set(sender.address, []);
  }
  const userHistory:any = chatHistory.get(sender.address)!;

  // Add user message to history
  userHistory.push({ role: "user", content: context.message.content.text });

  try {
    // Execute agent with user's message and chat history
    const result = await executor.invoke({
      input: text,
      chat_history: userHistory,
    });

    console.log("Agent response:", result.output);
    const output = result.output.replace(/\*/g, '');
    
    // Add assistant's response to history
    userHistory.push({ role: "assistant", content: output });
    
    await context.send(output);
  } catch (error) {
    console.error("Error:", error);
    // Add error message to history
    userHistory.push({ role: "assistant", content: "An error occurred while processing your request." });
    await context.send("An error occurred while processing your request.");
  }
}, { skills: [] });
