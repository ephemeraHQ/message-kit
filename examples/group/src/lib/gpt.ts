import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

// Use a Map to store daily question counts per user
let dailyQuestionCountPerUser: Map<string, Record<string, number>> = new Map();

export default async function openaiCall(
  content: string,
  senderAddress: string,
  systemPrompt: string,
) {
  let messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];
  // Check if the limit of 5 questions per day has been reached
  const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
  let userDailyCount = dailyQuestionCountPerUser.get(senderAddress) || {};
  /*if (userDailyCount[today] >= 5) {
    // If the limit is reached, return a warning message
    return {
      reply:
        "Oops, looks like you've hit the 5-question cap! At this rate, my OpenAI key's gonna drain faster than Fabri's crypto funds. NGMI, try again tomorrow!",
      messages,
    };
  }*/

  try {
    if (content.toLowerCase() === "stop") {
      // Reset the conversation state
      messages = [
        {
          role: "system",
          content: systemPrompt,
        },
      ];
    } else {
      // Add the user's message to the conversation history
      messages.push({
        role: "user",
        content: content,
      });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
    });
    const reply = response.choices[0].message.content;
    // Add the assistant's reply to the conversation history
    messages.push({
      role: "assistant",
      content: reply || "No response from OpenAI.",
    });

    userDailyCount[today] = (userDailyCount[today] || 0) + 1;
    dailyQuestionCountPerUser.set(senderAddress, userDailyCount);

    return { reply, messages };
  } catch (error) {
    console.error("Failed to fetch from OpenAI:", error);
    throw error;
  }
}
