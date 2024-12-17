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
    const address = req.nextUrl.searchParams.get("address") ?? "";

    const user = await getUserInfo(address);
    console.log("Resolved user info:", user);

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
        },
      );
    }
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#000000",
            height: "100%",
            width: "100%",
            padding: "60px",
          }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: "16px",
            }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "16px",
                color: "#fa6977",
              }}>
              <div style={{ fontSize: "44px" }}>{`Talk to`}</div>
            </div>
            <div style={{ fontSize: "64px", color: "#fa6977" }}>
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
      },
    );
  } catch (error) {
    console.error("Error generating image response:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
