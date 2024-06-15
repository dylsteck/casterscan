import Image from "next/image";
import Feed from "./components/feed";
import { fetchMetadata } from 'frames.js/next'
import { Metadata } from "next";

const PAGE = {
  title: "Casterscan",
  description: "A block explorer for Farcaster",
  url: "https://casterscan.com",
};

export async function generateMetadata(){
  return{
    metadataBase: new URL(PAGE.url),
    title: {
      default: PAGE.title,
      template: '%s | Casterscan',
    },
    description: PAGE.description,
    openGraph: {
      title: PAGE.title,
      description: PAGE.description,
      images: ['https://i.imgur.com/KJ7qfro.png'],
      url: PAGE.url,
      siteName: PAGE.title,
      locale: 'en_US',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      ...(await fetchMetadata(
        new URL(
          "/frames",
          process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000"
        )
      )),
    },
  } as Metadata
}

export default function Home() {
  return (
    <main>
      <Feed />
    </main>
  );
}
