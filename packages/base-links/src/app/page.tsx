"use client";
import { GeistMono as geistMono } from "geist/font/mono";
import { GeistSans as geistSans } from "geist/font/sans";
import Head from "next/head";
import UrlGenerator from "../components/UrlGenerator";
import { useState } from "react";

export default function Home() {
  const url = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}`;
  let image = `${url}/hero.jpg`;
  const [formData, setFormData] = useState({
    txLink:
      "https://sepolia.basescan.org/tx/0x2ec524f740c5831b16ca84053f9b6ae3e3923d3399d527113982e884a75e6bfa",
    networkLogo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    amount: "1",
    networkName: "Base",
    tokenName: "usdc",
  });

  const [generatedUrl, setGeneratedUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = window.location.origin;

    // Create URLSearchParams object to properly encode parameters
    const params = new URLSearchParams({
      txLink: formData.txLink,
    });

    setGeneratedUrl(`${baseUrl}/receipt?txLink=${formData.txLink}`);
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <meta property="og:title" content="MessageKit" />
        <meta property="og:image" content={image} />
        <meta property="fc:frame" content="vNext" />
        <meta property="of:version" content="vNext" />
        <meta property="of:accepts:xmtp" content="vNext" />
        <meta property="of:image" content={image} />
        <meta property="fc:frame:image" content={image} />
        <meta property="fc:frame:button:1" content="Docs" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta
          property="fc:frame:button:1:target"
          content="https://message-kit.org/"
        />

        <meta property="fc:frame:button:2" content="Drop a ⭐️" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta
          property="fc:frame:button:2:target"
          content="https://github.com/ephemeraHQ/message-kit"
        />
      </Head>
      <body>
        <div
          className={`container ${geistSans.variable} ${geistMono.variable}`}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            padding: "20px",
            boxSizing: "border-box",
          }}>
          <div
            className="wrapper"
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              gap: "20px",
              textAlign: "center",
              maxWidth: "800px",
              width: "100%",
            }}>
            <div style={{}}>
              <h1
                className={`title ${geistSans.className}`}
                style={{ marginBottom: "20px" }}>
                base-links
              </h1>
              <p
                className={`description ${geistSans.className}`}
                style={{ marginBottom: "40px" }}>
                Generate payment links with QR code for coinbase wallet
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  flexDirection: "column",
                }}>
                <UrlGenerator
                  params={{
                    recipientAddress: "",
                    amount: 0,
                    chainId: "1",
                    tokenAddress: "",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </body>
    </>
  );
}
