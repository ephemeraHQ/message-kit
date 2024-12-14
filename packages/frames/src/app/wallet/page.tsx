import { parseUnits } from "viem";
import PaymentFrame from "../../components/PaymentFrame";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = {
    url: process.env.NEXT_PUBLIC_URL,
    recipientAddress:
      (resolvedSearchParams?.recipientAddress as string) ||
      "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
    chainId: parseInt(resolvedSearchParams?.chainId as string) || 8453,
    baseLogo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    networkName: "base",
  };

  const baseScanUrl = `https://basescan.org/address/${params.recipientAddress}`;

  const image = `${params.url}/api/image?s=1&networkLogo=${params.baseLogo}&networkName=${params.networkName}&address=${params.recipientAddress}`;

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

        <meta property="fc:frame:button:1" content="View on Base Scan" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content={baseScanUrl} />

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
        <PaymentFrame params={params} baseScanUrl={baseScanUrl} image={image} />
      </body>
    </html>
  );
}
