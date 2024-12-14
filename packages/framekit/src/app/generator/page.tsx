import UrlGenerator from "../../components/UrlGenerator";

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
      "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
    tokenAddress:
      (resolvedSearchParams?.tokenAddress as string) ||
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", //usdc
    chainId: parseInt(resolvedSearchParams?.chainId as string) || 8453,
    amount: parseFloat(resolvedSearchParams?.amount as string) || 1,
    baseLogo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    networkName: "base",
    tokenName: "usdc",
    onRampURL: resolvedSearchParams?.onRampURL as string,
  };
  return (
    <html>
      <head></head>
      <body>
        <UrlGenerator params={params} />
      </body>
    </html>
  );
}
