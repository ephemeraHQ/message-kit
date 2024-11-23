import { parseUnits } from "viem";
import UrlGenerator from "@/components/UrlGenerator";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams; // Await the promises
  //tes sd
  const params = {
    url: `${process.env.NEXT_PUBLIC_URL}`,
    recipientAddress:
      (resolvedSearchParams?.recipientAddress as string) ||
      "0x277C0dd35520dB4aaDDB45d4690aB79353D3368b",
    tokenAddress:
      (resolvedSearchParams?.tokenAddress as string) ||
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", //usdc
    chainId: parseInt(resolvedSearchParams?.chainId as string) || 8453,
    amount: parseFloat(resolvedSearchParams?.amount as string) || 1,
    baseLogo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    networkName: "base",
    tokenName: "usdc",
  };
  const amountUint256 = parseUnits(params.amount.toString(), 6);
  const ethereumUrl = `ethereum:${params.tokenAddress}@${params.chainId}/transfer?address=${params.recipientAddress}&uint256=${amountUint256}`;

  const image = `${params.url}/api/image?s=1&networkLogo=${params.baseLogo}&amount=${params.amount}&networkName=${params.networkName}&tokenName=${params.tokenName}&recipientAddress=${params.recipientAddress}&tokenAddress=${params.tokenAddress}&chainId=${params.chainId}&networkId=${params.chainId}`;
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

        <meta
          property="fc:frame:button:1"
          content={`Pay $${params.amount} (Mobile)`}
        />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content={ethereumUrl} />
      </head>
      <body>
        <UrlGenerator params={params} />
      </body>
    </html>
  );
}
