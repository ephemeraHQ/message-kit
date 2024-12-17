import Head from "next/head";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <Head>
        <title>FrameKit</title>
      </Head>
      <body>{children}</body>
    </html>
  );
}
