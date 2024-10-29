import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function textGeneration(
  userPrompt: string,
  systemPrompt: string,
  chatHistory?: any[]
) {
  let messages = chatHistory ? [...chatHistory] : []; // Start with existing chat history
  if (messages.length === 0) {
    messages.push({
      role: "system",
      content: systemPrompt,
    });
  }
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
    const cleanedReply = responseParser(reply as string);

    return { reply: cleanedReply, history: messages };
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

export function responseParser(message: string) {
  let trimmedMessage = message;
  // Remove bold and underline markdown
  trimmedMessage = trimmedMessage?.replace(/(\*\*|__)(.*?)\1/g, "$2");
  // Remove markdown links, keeping only the URL
  trimmedMessage = trimmedMessage?.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2");
  // Remove markdown headers
  trimmedMessage = trimmedMessage?.replace(/^#+\s*(.*)$/gm, "$1");
  // Remove inline code formatting
  trimmedMessage = trimmedMessage?.replace(/`([^`]+)`/g, "$1");
  // Remove single backticks at the start or end of the message
  trimmedMessage = trimmedMessage?.replace(/^`|`$/g, "");
  // Remove leading and trailing whitespace
  trimmedMessage = trimmedMessage?.replace(/^\s+|\s+$/g, "");
  // Remove any remaining leading or trailing whitespace
  trimmedMessage = trimmedMessage.trim();
  return trimmedMessage;
}
