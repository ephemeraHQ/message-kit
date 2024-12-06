import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const web: Skill[] = [
  {
    skill: "web",
    examples: ["/web https://message-kit.org"],
    handler: handler,
    description: "Get information about a website.",
    params: {
      url: {
        type: "url",
      },
    },
  },
];

export async function handler(context: XMTPContext) {
  const {
    message: {
      content: {
        params: { url },
      },
    },
  } = context;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        code: response.status,
        message: `Unable to access website: ${response.statusText}`,
      };
    }

    const html = await response.text();
    const content = extractContent(html);
    const summary = await getAISummary(content, url);
    
    return {
      code: 200,
      message: summary,
    };
  } catch (error: any) {
    return {
      code: 500,
      message: `Could not analyze website: ${error.message}`,
    };
  }
}

function extractContent(html: string): string {
  // Remove scripts and style elements
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Get text content
  const text = html.replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim()
                  .slice(0, 1000);

  return text;
}

async function getAISummary(content: string, url: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `What is ${url} about? Summarize it in 2-3 sentences based on the following content: \n${content}\n\nDon't include any pretext but include the url in the summary.`
      }
    ],
    model: "gpt-4o-mini",
  });

  return completion.choices[0].message.content || "Could not generate summary. Please visit the website directly.";
}
