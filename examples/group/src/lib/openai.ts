import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "sk-proj-BZeFg03TnggnhTkyryXdT3BlbkFJO2UFQSDKdiKLFDxQAtQ2",
});

export async function openaiCall(userPrompt: string, systemPrompt: string) {
  let messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  try {
    if (userPrompt.toLowerCase() === "stop") {
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
        content: userPrompt,
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

    return { reply: reply as string, history: messages };
  } catch (error) {
    console.error("Failed to fetch from OpenAI:", error);
    throw error;
  }
}

// New method to interpret an image
export async function interpretImage(imageUrl: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What’s in this image?" },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });
    return response.choices[0];
  } catch (error) {
    console.error("Failed to interpret image with OpenAI:", error);
    throw error;
  }
}
