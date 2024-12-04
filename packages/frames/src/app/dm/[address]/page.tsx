"use client";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";

const Chat = dynamic(() => import("../../../components/Chat"), {
  ssr: false,
});

export default function ChatFrame(): JSX.Element {
  const params = useParams();
  const address = params.address as string;

  return (
    <FrameHTML address={address}>
      <Suspense fallback={<div>Loading...</div>}>
        <ChatContent />
      </Suspense>
    </FrameHTML>
  );
}

// Create a wrapper component that will render the full HTML
function FrameHTML({
  children,
  address,
}: {
  children: React.ReactNode;
  address: string;
}) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}`;
  const image = `${baseUrl}/api/dm?address=${address}`;

  console.log(image);
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Chat Frame</title>
        <meta property="og:image" content={image} />
        <meta property="fc:frame" content="vNext" />
        <meta property="of:version" content="vNext" />
        <meta property="of:accepts:xmtp" content="vNext" />
        <meta property="fc:frame:image" content={image} />
        <meta property="fc:frame:button:1" content="Start Chat" />
      </head>
      <body>{children}</body>
    </html>
  );
}

function ChatContent(): JSX.Element {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const params = useParams();
  const address = params.address as string;

  useEffect(() => {
    const initFrame = async () => {
      setContext(await sdk.context);
      sdk.actions.ready();
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      initFrame();
    }
  }, [isSDKLoaded]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Chat recipientAddress={address} />
    </div>
  );
}
