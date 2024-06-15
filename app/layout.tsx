import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import Header from "./components/header";

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
        url: 'https://i.imgur.com/KJ7qfro.png',
        width: 1200,
        height: 634,
        alt: 'og:image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: 'https://i.imgur.com/PD1XTs5.jpeg'
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE.title,
    description: PAGE.description,
    creator: '@Dylan_Steck',
    images: ['https://i.imgur.com/KJ7qfro.png'],
  },
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
        {children}
      </body>
    </html>
  );
}
