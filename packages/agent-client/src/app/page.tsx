"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";
import { getUserInfo, type UserInfo } from "@/app/utils/resolver";
import Chat from "../components/Chat";

export default function Home(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent(): JSX.Element {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  console.log("address", address);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("Fetching user info for address:", address);
        const userInfo = await getUserInfo(address as string);
        console.log("Fetched user info:", userInfo);

        setUser(userInfo ?? null);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [address]);

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
  return <>{children}</>;
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
