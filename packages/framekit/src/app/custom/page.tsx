export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams; // Await the promise

  // Extract meta tags from searchParams
  const {
    title = "FrameKit",
    frame = "custom",
    version = "vNext",
    accepts = "vNext",
    image,
    buttons = "[]", // Default to an empty array if not provided
  } = resolvedSearchParams;

  // Parse buttons from JSON string
  let parsedButtons = JSON.parse(buttons as string);

  // Create a JSON object for the meta tags
  const metaTags = {
    "og:title": title,
    "fc:frame": frame,
    "of:version": version,
    "of:accepts:xmtp": accepts,
    "of:image": image,
    "og:image": image,
    "fc:frame:image": image,
    "fc:frame:ratio": "1.91:1",
    "fc:frame:buttons": parsedButtons,
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        {Object.entries(metaTags).map(([key, value]) => (
          <meta
            key={key}
            property={key}
            content={typeof value === "object" ? JSON.stringify(value) : value}
          />
        ))}
      </head>
      <body>
        <pre>{JSON.stringify(metaTags, null, 2)}</pre>
      </body>
    </html>
  );
}
