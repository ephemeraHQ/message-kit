import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs";
import { join } from "path";
// @ts-ignore
import QRCode from "qrcode";
import { parseUnits } from "viem";
import { extractFrameChain } from "@/app/utils/networks";
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
    let searchParams = req.nextUrl.searchParams;
    let params = {
      url: process.env.NEXT_PUBLIC_URL,
      amount: searchParams.get("amount") ?? "1",
      recipientAddress:
        searchParams.get("recipientAddress") ??
        searchParams.get("recipientaddress") ??
        "",
      networkId:
        searchParams.get("networkId") ??
        searchParams.get("networkid") ??
        "base",
    };
    const toComponent =
      "To: " +
      params.recipientAddress?.slice(0, 4) +
      "..." +
      params.recipientAddress?.slice(-4);

    const { chainId, networkName, tokenName, networkLogo, tokenAddress } =
      extractFrameChain(params.networkId);
    const amountUint256 = parseUnits(params.amount.toString(), 6);
    const ethereumUrl = `ethereum:${tokenAddress}@${chainId}/transfer?address=${params.recipientAddress}&uint256=${amountUint256}`;

    const qrCodeDataUrl = await QRCode.toDataURL(ethereumUrl);

    if (
      !networkName ||
      !networkLogo ||
      !params.amount ||
      !tokenName ||
      !params.recipientAddress
    ) {
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
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            background: "white",
            height: "100%",
            width: "100%",
            padding: "48px",
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
              }}>
              <img
                src={networkLogo}
                style={{
                  borderRadius: "25px",
                  width: "30px",
                }}
              />
              <div style={{ fontSize: "24px" }}>{networkName}</div>
            </div>
            <div style={{ fontSize: "56px", display: "flex" }}>
              Pay
              <div
                style={{
                  fontFamily: "Inter-SemiBold",
                  display: "flex",
                  marginLeft: "8px",
                }}>
                {params.amount} {tokenName}
              </div>
            </div>
            <div style={{ fontSize: "24px" }}>{toComponent}</div>
          </div>
          <img src={qrCodeDataUrl} alt="QR Code" width={350} height={350} />
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
