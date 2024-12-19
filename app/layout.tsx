import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import Header from "./components/header";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BANNER_IMG_URL, frame, ICON_IMG_URL } from "./lib/utils";
import FrameProvider from "./components/frame-provider";

const PAGE = {
  title: "Casterscan",
  description: "A block explorer for Farcaster",
  url: "https://casterscan.com",
};

export const metadata: Metadata = {
  title: PAGE.title,
  description: PAGE.description,
  openGraph: {
    title: PAGE.title,
    description: PAGE.description,
    url: PAGE.url,
    siteName: PAGE.title,
    images: [
      {
        url: BANNER_IMG_URL,
        width: 1200,
        height: 634,
        alt: 'og:image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: ICON_IMG_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE.title,
    description: PAGE.description,
    creator: '@Dylan_Steck',
    images: [BANNER_IMG_URL],
  },
  other: {
    "fc:frame": JSON.stringify(frame())
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <Header />
        <FrameProvider>
          {children}
        </FrameProvider>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? ""}`} />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? ""}');
          `}
        </Script>
      </body>
    </html>
  );
}
