import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tx Pay",
  description: "TxPay by humanagent.eth",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
