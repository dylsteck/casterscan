import ProfileDetails from '@/app/components/custom/profile-details/index';
import { getNeynarUser, getFarcasterKeys } from '@/app/lib/server';
import { BASE_URL, frame, SEO } from '@/app/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata(props: { params: Promise<{ fid: string }> }) {
  const params = await props.params;
  const { fid } = params;
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
      "fc:frame": JSON.stringify(frame('Inspect Profile', `${BASE_URL}/profiles/${fid}`)),
    }
  } as Metadata;
}

export default async function Profile(props: { params: Promise<{ fid: string }> }) {
  const params = await props.params;
  const { fid } = params;
  const [neynarUser, keysData] = await Promise.all([
    getNeynarUser(fid),
    getFarcasterKeys(fid)
  ]);
  
  if (!neynarUser || !keysData) {
    notFound();
  }
  
  return <ProfileDetails fid={fid} neynarUser={neynarUser} keysData={keysData} />;
}
