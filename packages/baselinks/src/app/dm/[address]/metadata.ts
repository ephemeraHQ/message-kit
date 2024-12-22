import { getUserInfo } from "@/app/utils/resolver";
import { Metadata, ResolvedMetadata } from "next";

type Props = {
  params: Promise<{ address: string }>;
};

// Helper function to safely get params
async function getParams(params: Promise<{ address: string }>) {
  const resolvedParams = await params;
  return {
    address: resolvedParams.address || "",
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const userInfo = await getUserInfo(resolvedParams?.address as string);
  const imageUrl = `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/api/dmimage?address=${userInfo?.address}`;
  console.log("imageUrl", imageUrl);
  return {
    title: `Chat with ${userInfo?.preferredName || resolvedParams?.address}`,
    other: {
      "og:image": imageUrl,
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl,
        button: {
          title: "Start Chat",
          action: {
            type: "launch_frame",
            name: "Chat App",
            url: `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/dm/${userInfo?.address}`,
            splashImageUrl: `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/messagekit-logo.png`,
            splashBackgroundColor: "#ffffff",
          },
        },
      }),
      "of:version": "vNext",
      "of:accepts:xmtp": "vNext",
      "fc:frame:image": imageUrl,
      "fc:frame:button:1": "Start Chat",
    },
  };
}
