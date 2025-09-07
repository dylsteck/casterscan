import CastDetails from '@/app/components/custom/cast-details';
import { getNeynarCast } from '@/app/lib/server';
import { BASE_URL, frame, SEO } from '@/app/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata(props: { params: Promise<{ hash: string }> }) {
  const params = await props.params;
  const { hash } = params;
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
    other: {
      "fc:frame": JSON.stringify(frame('Inspect Cast', `${BASE_URL}/casts/${hash}`)),
    }
  } as Metadata;
}

export default async function Hash(props: { params: Promise<{ hash: string }> }) {
  const params = await props.params;
  const { hash } = params;
  const neynarCast = await getNeynarCast(hash, 'hash');
  
  if (!neynarCast) {
    notFound();
  }
  
  return <CastDetails hash={hash} neynarCast={neynarCast} />;
}