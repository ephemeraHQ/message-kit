import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const search: Skill[] = [
  {
    skill: "search",
    examples: [
      "/search what is the capital of France?",
      "/search latest news about ethereum",
    ],
    handler: handler,
    description:
      "Search the internet and get summarized information from top results.",
    params: {
      query: {
        type: "prompt",
      },
    },
  },
];

export async function handler(context: XMTPContext) {
  const {
    message: {
      content: {
        params: { query },
      },
    },
  } = context;

  try {
    // Search and get top results
    const searchResults = await searchDuckDuckGo(query);
    if (!searchResults.length) {
      return {
        code: 404,
        message: "No results found for your query.",
      };
    }

    // Fetch content from each result
    const contents = await Promise.all(
      searchResults.slice(0, 3).map(async (url) => {
        try {
          const response = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          });
          const html = await response.text();
          return extractContent(html);
        } catch (error) {
          console.error(`Error fetching ${url}:`, error);
          return "";
        }
      }),
    );

    // Combine and summarize the content
    const summary = await getAISummary(contents.join("\n"), query);

    return {
      code: 200,
      message: summary,
    };
  } catch (error: any) {
    return {
      code: 500,
      message: `Search failed: ${error.message}`,
    };
  }
}

async function searchDuckDuckGo(query: string): Promise<string[]> {
  try {
    // DuckDuckGo's lite version is more friendly to programmatic access
    const response = await fetch(
      `https://duckduckgo.com/lite?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
    );

    const html = await response.text();

    // Extract URLs from the results
    const urlRegex = /<a class="result-link" href="([^"]+)"/g;
    const urls: string[] = [];
    let match;

    while ((match = urlRegex.exec(html)) !== null) {
      if (match[1] && !match[1].includes("duckduckgo.com")) {
        urls.push(match[1]);
      }
    }

    // If no results from regex, try alternative pattern
    if (urls.length === 0) {
      const altRegex = /rel="nofollow" href="([^"]+)"/g;
      while ((match = altRegex.exec(html)) !== null) {
        if (match[1] && !match[1].includes("duckduckgo.com")) {
          urls.push(match[1]);
        }
      }
    }

    return urls;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

function extractContent(html: string): string {
  // Remove scripts and style elements
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Get text content
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000); // Get more content for search results

  return text;
}

async function getAISummary(content: string, query: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that provides clear, accurate summaries (2-3 sentences) of search results.",
      },
      {
        role: "user",
        content: `Based on the following search results, please provide a comprehensive answer to the query: "${query}"\n\nSearch results:\n${content}`,
      },
    ],
    model: "gpt-4o-mini",
  });

  return (
    completion.choices[0].message.content ||
    "Could not generate a summary of the search results."
  );
}
