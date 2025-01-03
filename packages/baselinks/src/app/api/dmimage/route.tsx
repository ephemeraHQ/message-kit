import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs";
import { isAddress } from "viem";
import { join } from "path";
import { getUserInfo } from "@/app/utils/resolver";

const interFontPath = join(process.cwd(), "public/fonts/Inter-Regular.ttf");
const interFontData = fs.readFileSync(interFontPath);

const interSemiboldFontPath = join(
  process.cwd(),
  "public/fonts/Inter-SemiBold.ttf",
);
const interSemiboldFontData = fs.readFileSync(interSemiboldFontPath);

export async function GET(req: NextRequest) {
  try {
    const headers = new Headers({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const address = req.nextUrl.searchParams.get("address") ?? "";

    const user = await getUserInfo(address);

    const params = {
      url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
      ...user,
    };
    if (!isAddress(params.address ?? "")) {
      return new ImageResponse(
        (
          <div
            style={{
              alignItems: "center",
              background: "black",
              display: "flex",
              flexDirection: "column",
              flexWrap: "nowrap",
              height: "100%",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
            }}>
            <div
              style={{
                color: "white",
                fontSize: 60,
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                marginTop: 30,
                padding: "0 120px",
                whiteSpace: "pre-wrap",
              }}>
              {`Invalid address!`}
            </div>
          </div>
        ),
        {
          width: 900,
          height: 600,
          fonts: [
            {
              data: interFontData,
              name: "Inter-SemiBold.ttf",
              style: "normal",
              weight: 400,
            },
          ],
          headers: headers,
        },
      );
    }
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#000000",
            height: "100%",
            width: "100%",
            padding: "40px",
          }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              maxWidth: "100%",
            }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                color: "#fa6977",
              }}>
              <div
                style={{
                  fontSize: "44px",
                  textAlign: "center",
                }}>{`Talk to`}</div>
            </div>
            <div
              style={{
                fontSize: "64px",
                color: "#fa6977",
                textAlign: "center",
                wordBreak: "break-word",
                maxWidth: "800px",
              }}>
              {params.preferredName}
            </div>
          </div>
        </div>
      ),
      {
        width: 900,
        height: 600,
        fonts: [
          {
            data: interFontData,
            name: "Inter-Regular",
          },
          {
            data: interSemiboldFontData,
            name: "Inter-SemiBold",
          },
        ],
        headers: headers,
      },
    );
  } catch (error) {
    console.error("Error generating image response:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
