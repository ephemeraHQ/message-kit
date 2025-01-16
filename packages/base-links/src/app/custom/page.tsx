import Head from "next/head";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams; // Await the promise

  // Extract meta tags from searchParams
  const {
    title = "frames",
    frame = "custom",
    version = "vNext",
    accepts = "vNext",
    image,
    buttons = "[]", // Default to an empty array if not provided
  } = resolvedSearchParams;

  let parsedButtons = JSON.parse(buttons as string);
  if (parsedButtons) {
    parsedButtons = parsedButtons.map((button: any, index: number) => ({
      [`fc:frame:button:${index + 1}`]: button.content,
      [`fc:frame:button:${index + 1}:action`]: button.action,
      [`fc:frame:button:${index + 1}:target`]: button.target,
    }));
  }
  const metaTags = {
    "og:title": title,
    "fc:frame": frame,
    "of:version": version,
    "of:accepts:xmtp": accepts,
    "of:image": image,
    "og:image": image,
    "fc:frame:image": image,
    "fc:frame:ratio": "1.91:1",
  };
  let metas = Object.entries(metaTags).map(([key, value]) => (
    <meta
      key={key}
      property={key}
      content={typeof value === "object" ? JSON.stringify(value) : value}
    />
  ));
  metas = [
    <meta key="viewport" name="viewport" content="width=device-width" />,
    ...metas,
    ...parsedButtons.map((button: any, index: number) => (
      <meta
        key={`fc:frame:button:${index + 1}`}
        property={`fc:frame:button:${index + 1}`}
        content={button[`fc:frame:button:${index + 1}`]}
      />
    )),
    ...parsedButtons.map((button: any, index: number) => (
      <meta
        key={`fc:frame:button:${index + 1}:action`}
        property={`fc:frame:button:${index + 1}:action`}
        content={button[`fc:frame:button:${index + 1}:action`]}
      />
    )),
    ...parsedButtons.map((button: any, index: number) => (
      <meta
        key={`fc:frame:button:${index + 1}:target`}
        property={`fc:frame:button:${index + 1}:target`}
        content={button[`fc:frame:button:${index + 1}:target`]}
      />
    )),
  ];
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        {metas}
      </Head>
      <body>
        <pre>{JSON.stringify(metaTags, undefined, 2)}</pre>
      </body>
    </>
  );
}
