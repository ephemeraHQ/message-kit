import { parseUnits } from "viem";
import PaymentFrame from "../../components/PaymentFrame";
import { extractFrameChain } from "../utils/networks";
import { Metadata } from "next";

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  searchParams: Promise<SearchParams>;
};

// Helper function to safely get search params
async function getParams(searchParams: Promise<SearchParams>) {
  const resolvedSearchParams = await searchParams;
  return {
    url: process.env.NEXT_PUBLIC_URL,
    recipientAddress:
      (resolvedSearchParams?.recipientAddress as string) ||
      (resolvedSearchParams?.recipientaddress as string),
    amount: parseFloat(resolvedSearchParams?.amount as string) || 1,
    onRampURL:
      (resolvedSearchParams?.onRampURL as string) ||
      (resolvedSearchParams?.onrampurl as string),
    networkId:
      (resolvedSearchParams?.networkId as string) ||
      (resolvedSearchParams?.networkid as string) ||
      "base",
  };
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await getParams(searchParams);
  const { chainId, tokenAddress } = extractFrameChain(params.networkId);
  const amountUint256 = parseUnits(params.amount.toString(), 6);
  const ethereumUrl = `ethereum:${tokenAddress}@${chainId}/transfer?address=${params.recipientAddress}&uint256=${amountUint256}`;
  const image = `${params.url}/api/payment?networkId=${params.networkId}&amount=${params.amount}&recipientAddress=${params.recipientAddress}`;

  return {
    title: "Ethereum Payment",
    other: {
      "fc:frame": "vNext",
      "of:version": "vNext",
      "of:accepts:xmtp": "vNext",
      "fc:frame:image": image,
      "og:image": image,
      "fc:frame:ratio": "1.91:1",
      "fc:frame:button:1": "Pay in USDC (Mobile)",
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target": ethereumUrl,
      ...(params.onRampURL && {
        "fc:frame:button:2": "Pay in USD",
        "fc:frame:button:2:action": "link",
        "fc:frame:button:2:target": params.onRampURL,
      }),
    },
  };
}

export default async function Home({ searchParams }: Props) {
  const params = await getParams(searchParams);
  const { chainId, tokenAddress } = extractFrameChain(params.networkId);
  const amountUint256 = parseUnits(params.amount.toString(), 6);
  const ethereumUrl = `ethereum:${tokenAddress}@${chainId}/transfer?address=${params.recipientAddress}&uint256=${amountUint256}`;
  const image = `${params.url}/api/payment?networkId=${params.networkId}&amount=${params.amount}&recipientAddress=${params.recipientAddress}`;

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
      <PaymentFrame url={ethereumUrl} image={image} label="Pay in USDC" />
    </div>
  );
}
