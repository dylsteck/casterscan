// Transform Snapchain event to displayable format
function transformEvent(event: any) {
  const eventType = event.type;
  const eventId = event.id;
  const shardIndex = event.shardIndex;
  const timestamp = new Date().toISOString();

  // Handle different event types
  if (eventType === 'HUB_EVENT_TYPE_MERGE_MESSAGE' && event.mergeMessageBody?.message) {
    const message = event.mergeMessageBody.message;
    const messageType = message.data?.type;

    if (messageType === 'MESSAGE_TYPE_CAST_ADD') {
      const castBody = message.data.castAddBody;
      const hash = message.hash || `unknown-${eventId}`;
      return {
        type: 'CAST_ADD',
        id: eventId,
        hash,
        text: castBody?.text || '',
        embeds: castBody?.embeds || [],
        mentions: castBody?.mentions || [],
        parentCastId: castBody?.parentCastId || null,
        parentUrl: castBody?.parentUrl || null,
        fid: message.data?.fid || 0,
        timestamp,
        author: null,
        link: !hash.startsWith('unknown-') ? `/casts/${hash}` : `https://snap.farcaster.xyz:3381/v1/eventById?event_id=${eventId}&shard_index=${shardIndex}`
      };
    } else if (messageType === 'MESSAGE_TYPE_REACTION_ADD') {
      const reactionBody = message.data.reactionBody;
      return {
        type: 'REACTION_ADD',
        id: eventId,
        hash: message.hash || `unknown-${eventId}`,
        reactionType: reactionBody?.type || 'UNKNOWN',
        targetCastId: reactionBody?.targetCastId || null,
        fid: message.data?.fid || 0,
        timestamp,
        author: null,
        link: `https://snap.farcaster.xyz:3381/v1/eventById?event_id=${eventId}&shard_index=${shardIndex}`
      };
    } else if (messageType === 'MESSAGE_TYPE_LINK_ADD') {
      const linkBody = message.data.linkBody;
      return {
        type: 'LINK_ADD',
        id: eventId,
        hash: message.hash || `unknown-${eventId}`,
        linkType: linkBody?.type || 'unknown',
        targetFid: linkBody?.targetFid || 0,
        fid: message.data?.fid || 0,
        timestamp,
        author: null,
        link: `https://snap.farcaster.xyz:3381/v1/eventById?event_id=${eventId}&shard_index=${shardIndex}`
      };
    } else if (messageType === 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS') {
      return {
        type: 'VERIFICATION_ADD',
        id: eventId,
        hash: message.hash || `unknown-${eventId}`,
        address: message.data.verificationAddAddressBody?.address || '',
        fid: message.data?.fid || 0,
        timestamp,
        author: null,
        link: `https://snap.farcaster.xyz:3381/v1/eventById?event_id=${eventId}&shard_index=${shardIndex}`
      };
    }
  } else if (eventType === 'HUB_EVENT_TYPE_MERGE_ON_CHAIN_EVENT' && event.mergeOnChainEventBody?.onChainEvent) {
    const onChainEvent = event.mergeOnChainEventBody.onChainEvent;
    return {
      type: 'ON_CHAIN_EVENT',
      id: eventId,
      hash: `onchain-${eventId}`,
      chainEventType: onChainEvent.type || 'UNKNOWN',
      chainId: onChainEvent.chainId || 0,
      blockNumber: onChainEvent.blockNumber || 0,
      fid: onChainEvent.fid || 0,
      timestamp,
      author: null,
      link: `https://snap.farcaster.xyz:3381/v1/eventById?event_id=${eventId}&shard_index=${shardIndex}`
    };
  }

  // Fallback for other event types
  return {
    type: 'OTHER',
    id: eventId,
    hash: `other-${eventId}`,
    eventType,
    fid: 0,
    timestamp,
    author: null,
    link: `https://snap.farcaster.xyz:3381/v1/eventById?event_id=${eventId}&shard_index=${shardIndex}`
  };
}

// Simple cache to avoid refetching on every request
let cachedEvents: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    const now = Date.now();
    let allEvents = cachedEvents;

    // Fetch fresh data if cache is empty or expired
    if (cachedEvents.length === 0 || now - lastFetchTime > CACHE_DURATION) {
      const response = await fetch(`https://snap.farcaster.xyz:3381/v1/events?from_event_id=0`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      allEvents = data.events || [];
      
      // Update cache
      cachedEvents = allEvents;
      lastFetchTime = now;
    }
    
    // Transform all events
    const transformedEvents = allEvents.map(transformEvent).filter(Boolean);
    
    // Apply pagination
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = transformedEvents.slice(startIndex, endIndex);
    
    // Calculate pagination metadata
    const totalEvents = transformedEvents.length;
    const totalPages = Math.ceil(totalEvents / limit);
    const hasNextPage = page < totalPages - 1;
    const hasPrevPage = page > 0;
    
    return Response.json({
      events: paginatedEvents,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error('Error in events API:', error);
    return Response.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 