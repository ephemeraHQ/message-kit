"use client";

import ReceiptGenerator from "../../components/ReceiptGenerator";
import { useEffect } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  let params = {
    url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}`,
    txLink:
      (resolvedSearchParams.txLink as string) ||
      (resolvedSearchParams.txlink as string) ||
      "",
    amount: resolvedSearchParams.amount as string,
    networkId:
      (resolvedSearchParams.networkId as string) ||
      (resolvedSearchParams.networkid as string) ||
      "base",
  };
  const image = `${params.url}/api/receipt?txLink=${params.txLink}&amount=${params.amount}&networkId=${params.networkId}`;

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== "undefined") {
      window.location.href = params.txLink;
    }
  }, [params.txLink]);

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
        <meta property="fc:frame:button:1:target" content={params.txLink} />
      </head>
      <body>
        <ReceiptGenerator />
      </body>
    </html>
  );
}
