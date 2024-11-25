"use client";
import { GeistMono as geistMono } from "geist/font/mono";
import { GeistSans as geistSans } from "geist/font/sans";

export default async function Home() {
  const url = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}`;
  let image = `${url}/hero.jpg`;
  return (
    <html>
      <head>
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
          content="https://messagekit.ephemerahq.com/"
        />

        <meta property="fc:frame:button:2" content="Drop a ⭐️" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta
          property="fc:frame:button:2:target"
          content="https://github.com/ephemeraHQ/message-kit"
        />
      </head>
      <body>
        <div
          className={`container ${geistSans.variable} ${geistMono.variable}`}>
          <div className="wrapper">
            <h1 className={`title ${geistSans.className}`}>FrameKit</h1>

            <div className="powered-by" style={{ marginTop: "1rem" }}>
              <a href="/payment" rel="noopener noreferrer">
                Payment
              </a>
            </div>
            <div className="powered-by" style={{ marginTop: "1rem" }}>
              <a href="/receipt" rel="noopener noreferrer">
                Receipt
              </a>
            </div>

            <div className="powered-by" style={{ marginTop: "1rem" }}>
              <a href="/custom" rel="noopener noreferrer">
                Custom
              </a>
            </div>
            <div
              className="powered-by"
              style={{
                marginTop: "3rem",
                width: "100%",
                marginBottom: "1rem",
              }}>
              Powered by{" "}
              <a
                href="https://github.com/ephemeraHQ/message-kit"
                target="_blank"
                rel="noopener noreferrer">
                MessageKit
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
