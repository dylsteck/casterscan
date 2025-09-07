import { NextRequest } from 'next/server'
import { CACHE_TTLS } from '../../../lib/utils';
import { snapchain, SnapchainError } from '../../../lib/snapchain';
import { withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (request: NextRequest) => {
  const url = new URL(request.url);
  const eventId = url.searchParams.get('event_id');
  const shardIndex = url.searchParams.get('shard_index');

  if (!eventId || !shardIndex) {
    return Response.json(
      { error: 'Missing required parameters: event_id and shard_index' },
      { status: 400 }
    );
  }

  try {
    const data = await snapchain.getEventById({
      event_id: eventId,
      shard_index: shardIndex
    });
    
    return Response.json(data, {
      headers: {
        'Cache-Control': `max-age=${CACHE_TTLS.LONG}`
      }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    
    if (error instanceof SnapchainError) {
      const statusMap = {
        'NOT_FOUND': 404,
        'BAD_REQUEST': 400,
        'TIMEOUT': 408,
        'INTERNAL_ERROR': 500,
        'NETWORK_ERROR': 500
      };
      
      return Response.json(
        { error: error.message },
        { status: statusMap[error.code] || 500 }
      );
    }
    
    return Response.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
});
