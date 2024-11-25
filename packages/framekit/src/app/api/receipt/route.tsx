import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs";
import { join } from "path";

export interface Network {
  networkId: string;
  networkName: string;
  networkLogo: string;
  tokenName: string;
  dripAmount: number;
  address: string;
  isERC20: boolean;
  erc20Address?: string;
  erc20Decimals?: number;
  isActive: boolean;
  balance: string;
}

const interFontPath = join(process.cwd(), "public/fonts/Inter-Regular.ttf");
const interFontData = fs.readFileSync(interFontPath);

const interSemiboldFontPath = join(
  process.cwd(),
  "public/fonts/Inter-SemiBold.ttf"
);
const interSemiboldFontData = fs.readFileSync(interSemiboldFontPath);

export async function GET(req: NextRequest) {
  const networkLogo = req.nextUrl.searchParams.get("networkLogo");
  const amount = req.nextUrl.searchParams.get("amount");
  const networkName = req.nextUrl.searchParams.get("networkName");
  const tokenName = req.nextUrl.searchParams.get("tokenName");
  if (!networkName || !networkLogo || !amount || !tokenName) {
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
          }}
        >
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
            }}
          >
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
      }
    );
  }
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
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <img
              src={networkLogo}
              style={{
                borderRadius: "25px",
                width: "40px",
              }}
            />
            <div style={{ fontSize: "20px" }}>{networkName}</div>
          </div>
          <div style={{ fontSize: "48px", display: "flex" }}>
            You just received{" "}
            <div
              style={{
                fontFamily: "Inter-SemiBold",
                display: "flex",
                marginLeft: "8px",
              }}
            >
              {" "}
              {amount} {tokenName}
            </div>
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
    }
  );
}
