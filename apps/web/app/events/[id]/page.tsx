import EventDetails from '@/app/components/custom/event-details';
import { BASE_URL, frame, SEO } from '@/app/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
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
      "fc:frame": JSON.stringify(frame('Inspect Event', `${BASE_URL}/events/${id}`)),
    }
  } as Metadata;
}

async function getEventData(eventId: string, shardIndex: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/snapchain/event?event_id=${eventId}&shard_index=${shardIndex}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching event data:', error);
    return null;
  }
}

export default async function EventPage(props: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ shard_index?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { id: eventId } = params;
  const shardIndex = searchParams.shard_index || '1';
  
  const eventData = await getEventData(eventId, shardIndex);
  
  if (!eventData) {
    notFound();
  }
  
  return <EventDetails eventId={eventId} shardIndex={shardIndex} eventData={eventData} />;
}
