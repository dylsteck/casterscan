import CastDetails from '@/app/components/cast-details';
import { SEO } from '@/app/lib/utils';
import { fetchMetadata } from 'frames.js/next';
import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ hash: string }> }) {
  const params = await props.params;
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

export default async function Hash(props: { params: Promise<{ hash: string }> }) {
  const params = await props.params;
  const { hash } = params;
  return <CastDetails hash={hash} />;
}