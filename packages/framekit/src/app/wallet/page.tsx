import { Metadata } from "next";
import PaymentFrame from "../../components/PaymentFrame";
import { extractFrameChain } from "../utils/networks";

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  searchParams: Promise<SearchParams>;
};

// Helper function to get params
async function getParams(searchParams: Promise<SearchParams>) {
  const resolvedSearchParams = await searchParams;
  return {
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
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await getParams(searchParams);
  const { chainId, tokenAddress } = extractFrameChain(params.networkId);
  const ethereumUrl = `ethereum:${tokenAddress}@${chainId}/transfer?address=${params.agentAddress}`;
  const image = `${params.url}/api/wallet?networkId=${params.networkId}&agentAddress=${params.agentAddress}&ownerAddress=${params.ownerAddress}&balance=${params.balance}`;

  return {
    title: "Wallet Information",
    other: {
      "fc:frame": "vNext",
      "of:version": "vNext",
      "of:accepts:xmtp": "vNext",
      "of:image": image,
      "og:image": image,
      "fc:frame:image": image,
      "fc:frame:ratio": "1.91:1",
      "fc:frame:button:1": "Base Scan",
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target": params.baseScanUrl,
      "fc:frame:button:2": "Add funds",
      "fc:frame:button:2:action": "link",
      "fc:frame:button:2:target": ethereumUrl,
    },
  };
}

export default async function Home({ searchParams }: Props) {
  const params = await getParams(searchParams);
  const { chainId, tokenAddress } = extractFrameChain(params.networkId);
  const ethereumUrl = `ethereum:${tokenAddress}@${chainId}/transfer?address=${params.agentAddress}`;
  const image = `${params.url}/api/wallet?networkId=${params.networkId}&agentAddress=${params.agentAddress}&ownerAddress=${params.ownerAddress}&balance=${params.balance}`;

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
      <PaymentFrame
        params={params}
        image={image}
        url={params.baseScanUrl}
        label="View on Base Scan"
      />
    </div>
  );
}
