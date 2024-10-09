import Image from "next/image";
import Feed from "./components/feed";
import { fetchMetadata } from 'frames.js/next'
import { Metadata } from "next";
import { SEO } from "./lib/consts";

export async function generateMetadata(){
  return{
    metadataBase: new URL(SEO.url),
    title: {
      default: SEO.title,
      template: `%s | ${SEO.title}`,
    },
    description: SEO.description,
    openGraph: {
      title: SEO.title,
      description: SEO.description,
      images: [SEO.ogImage],
      url: SEO.url,
      siteName: SEO.title,
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
