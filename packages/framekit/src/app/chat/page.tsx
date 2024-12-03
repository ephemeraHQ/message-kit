"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";

const Chat = dynamic(() => import("../../components/Chat"), {
  ssr: false,
});

// Create a wrapper component that will render the full HTML
function FrameHTML({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Chat Frame</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://your-image-url.png" />
        <meta property="fc:frame:button:1" content="Start Chat" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { 
              margin: 0; 
              padding: 0; 
              width: 100%; 
              height: 100vh; 
            }
          `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

export default function ChatFrame(): JSX.Element {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const searchParams = useSearchParams();

  const recipient =
    searchParams?.get("recipient") ||
    "0xc9925662D36DE3e1bF0fD64e779B2e5F0Aead964";

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

  // Loading state
  if (!isSDKLoaded) {
    return (
      <FrameHTML>
        <div>Loading...</div>
      </FrameHTML>
    );
  }

  return (
    <FrameHTML>
      <div style={{ height: "100vh", width: "100%" }}>
        <Chat recipientAddress={recipient} frameContext={context} />
      </div>
    </FrameHTML>
  );
}
