import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FrameKit",
  description: "FrameKit by message-kit",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
