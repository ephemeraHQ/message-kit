import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs";
import { join } from "path";

export interface Network {
  networkId: string;
  networkName: string;
  networkLogo: string;
  amount: number;
  tokenName: string;
  recipientAddress: string;
}

const interFontPath = join(process.cwd(), "public/fonts/Inter-Regular.ttf");
const interFontData = fs.readFileSync(interFontPath);

const interSemiboldFontPath = join(
  process.cwd(),
  "public/fonts/Inter-SemiBold.ttf",
);
const interSemiboldFontData = fs.readFileSync(interSemiboldFontPath);

export async function GET(req: NextRequest) {
  try {
    const collectionId = req.nextUrl.searchParams.get("collectionId") as string;
    const tokenId = req.nextUrl.searchParams.get("tokenId") as string;

    const toComponent =
      "Collection: " +
      collectionId?.slice(0, 4) +
      "..." +
      collectionId?.slice(-4);

    console.log({ collectionId, tokenId, toComponent });
    if (!collectionId || !tokenId) {
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
              {`Invalid network!`}
            </div>
          </div>
        ),
        {
          width: 500,
          height: 500,
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
    // ... existing code ...
    return new ImageResponse(
      (
        <div
          style={{
            alignItems: "center",
            background: "white",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            height: "100%",
            width: "100%",
            padding: "48px",
          }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}></div>
            <div style={{ fontSize: "48px", display: "flex" }}>
              Mint NFT id:
              <div
                style={{
                  fontFamily: "Inter-SemiBold",
                  display: "flex",
                  marginLeft: "8px",
                }}>
                {tokenId}
              </div>
            </div>
            <div style={{ fontSize: "30px" }}>{toComponent}</div>
          </div>
        </div>
      ),
      {
        width: 955,
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
