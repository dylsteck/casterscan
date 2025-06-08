import { BASE_URL, cachedRequest } from "@/app/lib/utils";

// Track active clients and stream state
let activeClients = 0;
let connectedControllers: ReadableStreamDefaultController[] = [];
let lastEventId = 0;
let pollingInterval: NodeJS.Timeout | null = null;

// Clean up resources when the server restarts
const cleanup = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  connectedControllers = [];
  activeClients = 0;
};

// Handle shutdown gracefully
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// Transform Snapchain event to displayable format
function transformEvent(event: any) {
  const eventType = event.type;
  const eventId = event.id;
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
        link: !hash.startsWith('unknown-') ? `/casts/${hash}` : `https://hub.merv.fun:2281/v1/eventById?id=${eventId}`
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
        link: `https://hub.merv.fun:2281/v1/eventById?id=${eventId}`
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
        link: `https://hub.merv.fun:2281/v1/eventById?id=${eventId}`
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
        link: `https://hub.merv.fun:2281/v1/eventById?id=${eventId}`
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
      link: `https://hub.merv.fun:2281/v1/eventById?id=${eventId}`
    };
  }

  // Fallback for other event types
  return {
    type: 'OTHER',
    id: eventId,
    hash: `other-${eventId}`,
    eventType,
    timestamp,
    author: null,
    link: `https://hub.merv.fun:2281/v1/eventById?id=${eventId}`
  };
}

// Fetch events from Snapchain
async function fetchSnapchainEvents() {
  try {
    const url = `http://hub.merv.fun:2281/v1/events?from_event_id=${lastEventId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const events = data.events || [];
    
    if (events.length > 0) {
      // Update lastEventId to the highest ID we've seen
      const maxId = Math.max(...events.map((e: any) => e.id));
      lastEventId = maxId;
      
      // Transform and send events
      for (const event of events) {
        const transformedEvent = transformEvent(event);
        
        const message = `data: ${JSON.stringify(transformedEvent)}\n\n`;
        
        // Filter out closed controllers and send to active ones
        const originalCount = connectedControllers.length;
        connectedControllers = connectedControllers.filter(controller => {
          try {
            // Check if controller is still writable
            if (controller.desiredSize === null) {
              // Controller is closed, don't include it
              activeClients = Math.max(0, activeClients - 1);
              return false;
            }
            controller.enqueue(message);
            return true;
          } catch (err) {
            // Controller is closed or errored, remove it
            console.log("Removing closed controller");
            activeClients = Math.max(0, activeClients - 1);
            return false;
          }
        });
        
        // If all clients disconnected, stop polling
        if (connectedControllers.length === 0 && originalCount > 0) {
          setTimeout(() => {
            if (activeClients === 0) {
              stopPolling();
            }
          }, 5000);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching Snapchain events:", error);
  }
}

// Start polling for events
const startPolling = () => {
  if (pollingInterval) return;
  
  pollingInterval = setInterval(fetchSnapchainEvents, 1000); // Poll every second
  fetchSnapchainEvents(); // Initial fetch
};

// Stop polling if no clients
const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

export async function GET() {
  activeClients++;
  
  try {
    const readableStream = new ReadableStream({
      async start(controller) {
        let keepAliveInterval: number | undefined;

        try {
          connectedControllers.push(controller);
          
          // Send initial ping
          controller.enqueue(`data: {"ping": true}\n\n`);
          
          // Start polling if this is the first client
          if (activeClients === 1) {
            startPolling();
          }
          
          // Set up keep-alive pings
          keepAliveInterval = setInterval(() => {
            // Clean up closed controllers during keep-alive
            connectedControllers = connectedControllers.filter(ctrl => {
              try {
                if (ctrl.desiredSize === null) {
                  return false; // Controller is closed
                }
                ctrl.enqueue(`data: {"ping": true}\n\n`);
                return true;
              } catch (err) {
                return false; // Controller errored, remove it
              }
            });
            
            // If no controllers left, clear the interval
            if (connectedControllers.length === 0 && keepAliveInterval) {
              clearInterval(keepAliveInterval);
            }
          }, 20000) as unknown as number;
        } catch (err) {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          const index = connectedControllers.indexOf(controller);
          if (index !== -1) {
            connectedControllers.splice(index, 1);
          }
          controller.close();
        }
      },
      cancel(controller) {
        // Remove controller when client disconnects
        const index = connectedControllers.indexOf(controller);
        if (index !== -1) {
          connectedControllers.splice(index, 1);
        }
        
        activeClients--;
        
        // If no more clients, stop polling after a delay
        if (activeClients === 0) {
          setTimeout(() => {
            if (activeClients === 0) {
              stopPolling();
            }
          }, 5000);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
      },
    });
  } catch (error) {
    activeClients--;
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}