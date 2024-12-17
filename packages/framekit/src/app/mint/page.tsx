"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import MintComponent from "../../components/MintComponent"; // Assuming there's a MintComponent

export default function MintPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, setParams] = useState({
    url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}`,
    txLink: "",
    amount: "",
    networkId: "base",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveParams() {
      const resolvedSearchParams = await searchParams;
      setParams({
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
      });
      setLoading(false);
    }
    resolveParams();
  }, [searchParams]);

  const image = `${params.url}/api/mint?txLink=${params.txLink}&amount=${params.amount}&networkId=${params.networkId}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Window object is available");
      if (params.txLink) {
        console.log("Redirecting to", params.txLink);
        window.location.href = params.txLink;
      } else {
        console.log("No txLink found, not redirecting");
      }
    } else {
      console.log("Window object is not available");
    }
  }, [params.txLink]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!params.txLink) {
    return (
      <>
        <Head>
          <meta charSet="utf-8" />
          <meta property="og:title" content="Mint Page" />
          <meta property="fc:frame" content="vNext" />
          <meta property="of:version" content="vNext" />
          <meta property="of:accepts:xmtp" content="vNext" />
          <meta property="of:image" content={image} />
          <meta property="og:image" content={image} />
          <meta property="fc:frame:image" content={image} />
          <meta property="fc:frame:ratio" content="1.91:1" />

          <meta property="fc:frame:button:1" content={`Mint Receipt`} />
          <meta property="fc:frame:button:1:action" content="link" />
          <meta property="fc:frame:button:1:target" content={params.txLink} />
        </Head>
        <MintComponent />
      </>
    );
  }

  return null;
}
