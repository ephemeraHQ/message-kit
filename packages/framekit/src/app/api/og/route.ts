import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 },
      );
    }

    console.log("Fetching OG data for URL:", url);

    const response = await fetch(url, {
      headers: {
        "user-agent": "bot",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract meta tags using cheerio
    const getMetaContent = (property: string) => {
      return (
        $(`meta[property="${property}"]`).attr('content') ||
        $(`meta[name="${property}"]`).attr('content')
      );
    };

    const ogData = {
      title:
        getMetaContent("og:title") ||
        getMetaContent("twitter:title") ||
        $('title').text() ||
        url,
      description:
        getMetaContent("og:description") ||
        getMetaContent("twitter:description") ||
        getMetaContent("description") ||
        "",
      image:
        getMetaContent("og:image") ||
        getMetaContent("twitter:image") ||
        "",
      url,
      siteName: getMetaContent("og:site_name") || "",
    };

    console.log("Extracted OG data:", ogData);

    return NextResponse.json(ogData);
  } catch (error) {
    console.error("Error in OG route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch OG data",
      },
      { status: 500 },
    );
  }
}

export const runtime = "edge";
export const dynamic = "force-dynamic";
