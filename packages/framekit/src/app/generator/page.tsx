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
    amount: parseFloat(resolvedSearchParams?.amount as string) || 1,
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
