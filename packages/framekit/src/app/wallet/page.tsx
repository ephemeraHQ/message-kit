import PaymentFrame from "../../components/PaymentFrame";
import { extractFrameChain } from "../utils/networks";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = {
    url: process.env.NEXT_PUBLIC_URL,
    agentAddress:
      (resolvedSearchParams?.agentAddress as string) ||
      (resolvedSearchParams?.agentaddress as string),
    recipientAddress:
      (resolvedSearchParams?.recipientAddress as string) ||
      (resolvedSearchParams?.recipientaddress as string),
    ownerAddress:
      (resolvedSearchParams?.ownerAddress as string) ||
      (resolvedSearchParams?.owneraddress as string),
    networkId:
      (resolvedSearchParams?.networkId as string) ||
      (resolvedSearchParams?.networkid as string),
    amount: 0,
    onRampURL:
      (resolvedSearchParams?.onRampURL as string) ||
      (resolvedSearchParams?.onrampurl as string),
    balance: (resolvedSearchParams?.balance as string) || "0.00",
    baseScanUrl:
      "https://basescan.org/address/" + resolvedSearchParams?.address,
  };
  const { chainId, tokenAddress } = extractFrameChain(params.networkId);
  const ethereumUrl = `ethereum:${tokenAddress}@${chainId}/transfer?address=${params.agentAddress}`;
  const image = `${params.url}/api/wallet?networkId=${params.networkId}&agentAddress=${params.agentAddress}&ownerAddress=${params.ownerAddress}&balance=${params.balance}`;

  return (
    <html
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: "white",
        height: "100%",
      }}>
      <head>
        <meta charSet="utf-8" />
        <meta property="og:title" content="Wallet Information" />
        <meta property="fc:frame" content="vNext" />
        <meta property="of:version" content="vNext" />
        <meta property="of:accepts:xmtp" content="vNext" />
        <meta property="of:image" content={image} />
        <meta property="og:image" content={image} />
        <meta property="fc:frame:image" content={image} />
        <meta property="fc:frame:ratio" content="1.91:1" />

        <meta property="fc:frame:button:1" content=" Base Scan" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta
          property="fc:frame:button:1:target"
          content={params.baseScanUrl}
        />
        <meta property="fc:frame:button:2" content="Add funds" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content={ethereumUrl} />

        <style>
          {`
          :root {
            --background: #ffffff;
            --foreground: #000000;
            --accent: #fa6977;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --background: #ffffff;
              --foreground: #000000;
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
            
            html, body {
              background-color: var(--background) !important;
              height: 100%;
              width: 100%;
            }

            body {
              display: inline-block;
            }

            .form-container {
              background-color: var(--background);  
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
              padding: 1.5rem;
            }
          `}
        </style>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "white",
          height: "100%",
          display: "inline-block",
          width: "100%",
        }}>
        <PaymentFrame
          params={params}
          image={image}
          url={params.baseScanUrl}
          label="View on Base Scan"
        />
      </body>
    </html>
  );
}
