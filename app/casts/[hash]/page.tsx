import { SEO } from '@/app/lib/consts';
import { fetchMetadata } from 'frames.js/next';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const CastDetails = dynamic(() => import('@/app/components/cast-details'), { ssr: false });

export async function generateMetadata({ params }: { params: { hash: string } }) {
  const { hash } = params;
  const metadata = await fetchMetadata(
    new URL(
      `/frames/cast?hash=${hash}`,
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
    )
  );
  return {
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
    other: metadata,
  } as Metadata;
}

export default function Hash({ params }: { params: { hash: string } }) {
  const { hash } = params;
  return <CastDetails hash={hash} />;
}