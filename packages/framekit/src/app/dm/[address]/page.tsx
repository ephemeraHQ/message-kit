"use client";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";
import { getUserInfo, type UserInfo } from "@/app/utils/resolver";

const Chat = dynamic(() => import("../../../components/Chat"), {
  ssr: false,
});

export default function ChatFrame(): JSX.Element {
  const params = useParams();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("Fetching user info for address:", params?.address);
        const userInfo = await getUserInfo(params?.address as string);
        console.log("Fetched user info:", userInfo);

        setUser(userInfo ?? null);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [params?.address]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <FrameHTML user={user}>
      <Suspense fallback={<div>Loading...</div>}>
        <ChatContent user={user} />
      </Suspense>
    </FrameHTML>
  );
}

// Create a wrapper component that will render the full HTML
function FrameHTML({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserInfo;
}) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}`;
  const image = `${baseUrl}/api/dm?address=${user.address}`;

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

function ChatContent({ user }: { user: UserInfo }): JSX.Element {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

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
      <Chat user={user} />
    </div>
  );
}
