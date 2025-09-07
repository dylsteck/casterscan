import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import Header from "./components/custom/header";
import Script from "next/script";
import { BANNER_IMG_URL, BASE_URL, frame, ICON_IMG_URL } from "./lib/utils";
import MiniAppProvider from "./components/custom/mini-app-provider";
import Providers from "./providers";
import { WebVitals } from "@/app/lib/axiom/client";
import { universalLogger } from "@/app/lib/axiom/universal";

const PAGE = {
  title: "Casterscan",
  description: "A block explorer for Farcaster",
  url: BASE_URL,
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
      <WebVitals />
      <body className={GeistSans.className}>
        <Providers>
          <MiniAppProvider>
            <div className="min-h-screen">
              <Header />
              {children}
            </div>
          </MiniAppProvider>
        </Providers>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? ""}`} />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? ""}');
          `}
        </Script>
        <Script id="error-handler">
          {`
            window.addEventListener('error', function(event) {
              console.error('Runtime error:', {
                message: event.error?.message || event.message,
                stack: event.error?.stack,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                url: window.location.href
              });
            });
            
            window.addEventListener('unhandledrejection', function(event) {
              console.error('Unhandled promise rejection:', {
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                url: window.location.href
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
