import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs";
import { join } from "path";
// @ts-ignore
import QRCode from "qrcode";

export interface WalletStatus {
  networkId: string;
  networkName: string;
  networkLogo: string;
  balance: string;
  tokenName: string;
  walletAddress: string;
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

    const params = {
      url: process.env.NEXT_PUBLIC_URL,
      networkLogo: searchParams.get("networkLogo"),
      balance: searchParams.get("balance") ?? "0",
      networkName: searchParams.get("networkName") ?? "base",
      tokenName: searchParams.get("tokenName") ?? "USDC",
      agentAddress: searchParams.get("agentAddress"),
      ownerAddress: searchParams.get("ownerAddress"),
      chainId: searchParams.get("chainId"),
      networkId: searchParams.get("networkId"),
      tokenAddress:
        searchParams.get("tokenAddress") ||
        "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    };

    const ownerComponent =
      "Owner: " +
      params.ownerAddress?.slice(0, 4) +
      "..." +
      params.ownerAddress?.slice(-4);

    const addressComponent =
      "Address: " +
      params.agentAddress?.slice(0, 4) +
      "..." +
      params.agentAddress?.slice(-4);

    // Generate QR code for funding the wallet

    const ethereumUrl = `ethereum:${params.tokenAddress}@${params.chainId}/transfer?address=${params.agentAddress}`;
    console.log(params);
    const qrCodeDataUrl = await QRCode.toDataURL(ethereumUrl);

    if (!params.networkName || !params.networkLogo || !params.agentAddress) {
      return new ImageResponse(
        (
          <div
            style={{
              alignItems: "center",
              background: "black",
              display: "flex",
              flexDirection: "column",
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
              {`Invalid wallet info!`}
            </div>
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
                src={params.networkLogo}
                style={{
                  borderRadius: "25px",
                  width: "30px",
                }}
              />
              <div style={{ fontSize: "24px" }}>{params.networkName}</div>
            </div>
            <div
              style={{
                fontSize: "56px",
                display: "flex",
                flexDirection: "column",
              }}>
              Balance
              <div
                style={{
                  fontFamily: "Inter-SemiBold",
                  display: "flex",
                  marginLeft: "8px",
                }}>
                {params.balance} {params.tokenName}
              </div>
            </div>
            <div style={{ fontSize: "24px" }}>{addressComponent}</div>
            <div style={{ fontSize: "24px" }}>{ownerComponent}</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}>
            <img src={qrCodeDataUrl} alt="QR Code" width={350} height={350} />
            <div style={{ fontSize: "16px", color: "#666" }}>
              Scan to fund wallet
            </div>
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
