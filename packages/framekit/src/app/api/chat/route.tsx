import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getUserInfo } from "@xmtp/message-kit";
import fs from "fs";
import { join } from "path";

const interFontPath = join(process.cwd(), "public/fonts/Inter-Regular.ttf");
const interFontData = fs.readFileSync(interFontPath);

const interSemiboldFontPath = join(
  process.cwd(),
  "public/fonts/Inter-SemiBold.ttf",
);
const interSemiboldFontData = fs.readFileSync(interSemiboldFontPath);

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    console.log("address", address);
    if (!address) {
      return new ImageResponse(
        (
          <div
            style={{
              color: "white",
              fontSize: 60,
              letterSpacing: "-0.025em",
              lineHeight: 1.4,
            }}>
            Invalid address
          </div>
        ),
        {
          width: 500,
          height: 500,
          fonts: [
            {
              data: interFontData,
              name: "Inter-Regular",
              style: "normal",
              weight: 400,
            },
          ],
        },
      );
    }

    const userInfo = await getUserInfo(address);
    const displayName =
      userInfo?.preferredName ||
      address.slice(0, 6) + "..." + address.slice(-4);

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: "64px",
            color: "#fa6977",
            fontFamily: "Inter-SemiBold",
            textAlign: "center",
          }}>
          {displayName}
        </div>
      ),
      {
        width: 500,
        height: 500,
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
      },
    );
  } catch (error) {
    console.error("Error generating image response:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
