"use client";
import { GeistMono as geistMono } from "geist/font/mono";
import { GeistSans as geistSans } from "geist/font/sans";
import Head from "next/head";

export default function Home() {
  const url = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}`;
  let image = `${url}/hero.jpg`;
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
          className={`container ${geistSans.variable} ${geistMono.variable}`}>
          <div className="wrapper">
            <h1 className={`title ${geistSans.className}`}>frames</h1>

            <div className="powered-by" style={{ marginTop: "1rem" }}>
              <a href="/payment" rel="noopener noreferrer">
                Payment
              </a>
            </div>
            <div className="powered-by" style={{ marginTop: "1rem" }}>
              <a href="/generator" rel="noopener noreferrer">
                Deeplink Generator
              </a>
            </div>
            <div className="powered-by" style={{ marginTop: "1rem" }}>
              <a href="/receipt" rel="noopener noreferrer">
                Receipt
              </a>
            </div>

            <div className="powered-by" style={{ marginTop: "1rem" }}>
              <a
                href="/dm/0xC60E6Bb79322392761BFe3081E302aEB79B30B03"
                rel="noopener noreferrer">
                Chat
              </a>
            </div>
            <div className="powered-by" style={{ marginTop: "1rem" }}>
              <a href="/custom" rel="noopener noreferrer">
                Custom
              </a>
            </div>
          </div>
        </div>
      </body>
    </>
  );
}
