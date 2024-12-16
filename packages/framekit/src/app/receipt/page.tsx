"use client";

import ReceiptGenerator from "../../components/ReceiptGenerator";
import { useEffect } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const url = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}`;
  const txLink = resolvedSearchParams.txLink as string;
  const amount = resolvedSearchParams.amount as string;
  const image = `${url}/api/receipt?txLink=${txLink}&amount=${amount}`;

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== "undefined") {
      window.location.href = txLink;
    }
  }, [txLink]);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta property="og:title" content="Ethereum Payment" />
        <meta property="fc:frame" content="vNext" />
        <meta property="of:version" content="vNext" />
        <meta property="of:accepts:xmtp" content="vNext" />
        <meta property="of:image" content={image} />
        <meta property="og:image" content={image} />
        <meta property="fc:frame:image" content={image} />
        <meta property="fc:frame:ratio" content="1.91:1" />

        <meta property="fc:frame:button:1" content={`Transaction Receipt`} />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content={txLink} />
      </head>
      <body>
        <ReceiptGenerator />
      </body>
    </html>
  );
}
