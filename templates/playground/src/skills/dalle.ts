import { Context } from "@xmtp/message-kit";

import type { Skill } from "@xmtp/message-kit";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dalle: Skill[] = [
  {
    skill: "image",
    handler: handler,
    description: "Generate an image based on a prompt.",
    examples: ["/image dog with a ball"],
    params: {
      prompt: {
        type: "prompt",
      },
    },
  },
];

export async function handler(context: Context) {
  const {
    message: {
      sender,
      content: {
        params: { prompt },
      },
    },
  } = context;

  if (!prompt) {
    return {
      code: 400,
      message: "Missing required parameters. Please provide a prompt.",
    };
  }

  try {
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;
    console.log(imageUrl);
    const message = `Here is the image generated for the prompt "${prompt}": ${imageUrl}`;
    context.send(message);
  } catch (error) {
    // @ts-ignore
    const message = `Failed to generate image. Error: ${error?.message}
    }`;
    return {
      code: 500,
      message,
    };
  }
}
