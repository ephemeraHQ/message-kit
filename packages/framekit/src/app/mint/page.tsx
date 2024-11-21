export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams; // Await the promise

  const url = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}`;
  const collectionId =
    (resolvedSearchParams.collectionId as string) ||
    "0x73a333cb82862d4f66f0154229755b184fb4f5b0";
  const tokenId = (resolvedSearchParams.tokenId as string) || "1";
  const mintLink = `ethereum:${collectionId}/mint?uint256=${tokenId}`;

  //ethereum:0x73a333cb82862d4f66f0154229755b184fb4f5b0/mint?uint256=1

  const image = `${url}/api/mint?collectionId=${collectionId}&tokenId=${tokenId}`;
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

        <meta property="fc:frame:button:1" content={`Mint `} />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content={mintLink} />
      </head>
      <body></body>
    </html>
  );
}
