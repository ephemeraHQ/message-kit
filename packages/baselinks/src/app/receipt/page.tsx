import { Metadata } from "next";
import ReceiptGenerator from "../../components/ReceiptGenerator";

type SearchParams = { [key: string]: string | string[] | undefined };

// Helper function to safely get search params
async function getParams(searchParams: Promise<SearchParams>) {
  const resolvedSearchParams = await searchParams;
  return {
    url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}`,
    txLink:
      String(resolvedSearchParams?.txLink || "") ||
      String(resolvedSearchParams?.txlink || "") ||
      "",
    amount: String(resolvedSearchParams?.amount || ""),
    networkId:
      String(resolvedSearchParams?.networkId || "") ||
      String(resolvedSearchParams?.networkid || "") ||
      "base",
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await getParams(searchParams);
  const image = `${params.url}/api/receipt?txLink=${params.txLink}&amount=${params.amount}&networkId=${params.networkId}`;

  return {
    title: "Ethereum Payment",
    other: {
      "fc:frame": "vNext",
      "of:version": "vNext",
      "of:accepts:xmtp": "vNext",
      "fc:frame:image": image,
      "og:image": image,
      "fc:frame:ratio": "1.91:1",
      "fc:frame:button:1": "Transaction Receipt",
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target": params.txLink,
    },
  };
}

export default async function ReceiptPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await getParams(searchParams);

  // If there's a txLink, redirect to it
  if (params.txLink && params.txLink !== "") {
    return (
      <div
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "white",
          height: "100%",
          display: "inline-block",
          width: "100%",
        }}>
        <meta httpEquiv="refresh" content={`0;url=${params.txLink}`} />
        Redirecting to transaction...
      </div>
    );
  }

  // If no txLink, show the receipt generator
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: "white",
        height: "100%",
        display: "inline-block",
        width: "100%",
      }}>
      <ReceiptGenerator />
    </div>
  );
}
