import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    console.log("Fetching OG data for URL:", url);

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 },
      );
    }

    // Fetch OpenGraph data from the target URL
    const response = await fetch(url, {
      headers: {
        "User-Agent": "bot",  // Some sites require a user agent
      },
    });

    if (!response.ok) {
      throw new Error(`Target URL returned status: ${response.status}`);
    }

    const html = await response.text();

    // More robust OG tag extraction
    const getMetaContent = (html: string, property: string) => {
      const match = html.match(
        new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*?)["']`, "i")
      );
      return match?.[1] || "";
    };

    const ogData = {
      title: getMetaContent(html, "og:title") || html.match(/<title>(.*?)<\/title>/i)?.[1] || "",
      description: getMetaContent(html, "og:description") || getMetaContent(html, "description") || "",
      image: getMetaContent(html, "og:image") || "",
      url,
    };

    console.log("Extracted OG data:", ogData);

    return NextResponse.json(ogData);
  } catch (error) {
    console.error("Error in OG route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch OG data" },
      { status: 500 },
    );
  }
}

// Configure CORS
export const runtime = "edge";
export const dynamic = "force-dynamic";
