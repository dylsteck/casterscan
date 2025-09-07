import { NextRequest } from 'next/server'
import { SNAPCHAIN_NODE_BASE_URL } from '../../../lib/utils';

export async function GET(request: NextRequest) {
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
    const response = await fetch(
      `${SNAPCHAIN_NODE_BASE_URL}:3381/v1/eventById?event_id=${eventId}&shard_index=${shardIndex}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    return Response.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}
