import { NextRequest } from 'next/server'
import { CACHE_TTLS } from '../../../lib/utils';
import { apiFetch } from '@/app/lib/api';
import { validateEventId } from '@/app/lib/validate';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const eventId = url.searchParams.get('event_id');
  const shardIndex = url.searchParams.get('shard_index') || '0';

  if (!validateEventId(eventId)) {
    return Response.json(
      { error: 'Missing or invalid parameter: event_id' },
      { status: 400 }
    );
  }

  try {
    const data = await apiFetch(`/v1/snapchain/events/${encodeURIComponent(eventId)}?shard_index=${encodeURIComponent(shardIndex)}`);
    return Response.json(data, {
      headers: { 'Cache-Control': `max-age=${CACHE_TTLS.FIFTEEN_MIN}` }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return Response.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
