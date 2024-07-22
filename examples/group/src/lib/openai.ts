import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function textGeneration(userPrompt: string, systemPrompt: string) {
  let messages = [];
  messages.push({
    role: "system",
    content: systemPrompt,
  });
  messages.push({
    role: "user",
    content: userPrompt,
  });
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
    });
    const reply = response.choices[0].message.content;
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
export async function vision(imageData: Uint8Array, systemPrompt: string) {
  const base64Image = Buffer.from(imageData).toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  // Create a new thread for each vision request
  const visionMessages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: [
        { type: "text", text: systemPrompt },
        {
          type: "image_url",
          image_url: {
            url: dataUrl,
          },
        },
      ],
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: visionMessages as any,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Failed to interpret image with OpenAI:", error);
    throw error;
  }
}
