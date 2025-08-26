import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SERVER_URL } from '../../lib/constants'
import { CopyButton } from '../../components/CopyButton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'

interface HubEvent {
  type: string;
  id: number;
  blockConfirmedBody?: {
    blockNumber: number;
    shardIndex: number;
    timestamp: number;
    blockHash: string;
    totalEvents: number;
  };
  mergeMessageBody?: {
    message: {
      data: {
        type: string;
        fid: number;
        timestamp: number;
        network: string;
        reactionBody?: {
          type: string;
          targetCastId: {
            fid: number;
            hash: string;
          };
        };
      };
      hash: string;
      hashScheme: string;
      signature: string;
      signatureScheme: string;
      signer: string;
    };
    deletedMessages: any[];
  };
  blockNumber: number;
  shardIndex: number;
}

async function fetchEvent(eventId: string): Promise<HubEvent> {
  console.log('Fetching event:', eventId, 'from:', `${SERVER_URL}/api/events/${eventId}`)
  const response = await fetch(`${SERVER_URL}/api/events/${eventId}`)
  console.log('Response status:', response.status)
  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.status}`)
  }
  const data = await response.json()
  console.log('Event data:', data)
  return data
}

export const Route = createFileRoute('/events/$id')({
  component: EventDetailPage,
})

function EventDetailPage() {
  const { id } = Route.useParams()
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEvent(id),
  })

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-start">
        <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
          <div className="animate-pulse mt-3">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="w-screen h-screen flex justify-center items-start">
        <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
          <p className="text-xl font-semibold mt-3">event details</p>
          <div className="p-2 border border-black">
            <p className="text-red-600">
              {error ? `Failed to load event data for ID: ${id}` : `Event with ID ${id} was not found.`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-4 mt-6 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Event #{event.id}</h1>
            <p className="text-gray-600">{event.type.replace('HUB_EVENT_TYPE_', '')}</p>
            <p className="text-sm text-gray-500">Block {event.blockNumber}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-200 border border-gray-300 p-1 rounded-lg h-12">
            <TabsTrigger value="overview" className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border-0 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md transition-all">Overview</TabsTrigger>
            <TabsTrigger value="block" className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border-0 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md transition-all">Block Data</TabsTrigger>
            <TabsTrigger value="message" className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border-0 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md transition-all">Message</TabsTrigger>
            <TabsTrigger value="raw" className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border-0 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md transition-all">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <div className="p-2 border border-black relative" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
              <ul className="list-none">
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">event id</span>
                  <span className="flex items-center text-right">
                    {event.id}
                    <CopyButton value={event.id.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">type</span>
                  <span className="flex items-center text-right">
                    {event.type.replace('HUB_EVENT_TYPE_', '')}
                    <CopyButton value={event.type} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">block number</span>
                  <span className="flex items-center text-right">
                    {event.blockNumber}
                    <CopyButton value={event.blockNumber.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">shard index</span>
                  <span className="flex items-center text-right">
                    {event.shardIndex}
                    <CopyButton value={event.shardIndex.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="block" className="mt-4">
            <div className="p-2 border border-black">
              {event.blockConfirmedBody ? (
                <ul className="list-none">
                  <li className="flex justify-between items-center mb-1">
                    <span className="font-semibold mr-1">block hash</span>
                    <span className="flex items-center text-right">
                      <span className="font-mono text-sm">{event.blockConfirmedBody.blockHash}</span>
                      <CopyButton value={event.blockConfirmedBody.blockHash} className="ml-1 flex-shrink-0" />
                    </span>
                  </li>
                  <li className="flex justify-between items-center mb-1">
                    <span className="font-semibold mr-1">total events</span>
                    <span className="flex items-center text-right">
                      {event.blockConfirmedBody.totalEvents}
                      <CopyButton value={event.blockConfirmedBody.totalEvents.toString()} className="ml-1 flex-shrink-0" />
                    </span>
                  </li>
                  <li className="flex justify-between items-center mb-1">
                    <span className="font-semibold mr-1">timestamp</span>
                    <span className="flex items-center text-right">
                      {new Date(event.blockConfirmedBody.timestamp * 1000).toLocaleString()}
                      <CopyButton value={event.blockConfirmedBody.timestamp.toString()} className="ml-1 flex-shrink-0" />
                    </span>
                  </li>
                </ul>
              ) : (
                <p className="text-gray-500">No block confirmation data available.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="message" className="mt-4">
            <div className="p-2 border border-black">
              {event.mergeMessageBody ? (
                <ul className="list-none">
                  <li className="flex justify-between items-center mb-1">
                    <span className="font-semibold mr-1">message type</span>
                    <span className="flex items-center text-right">
                      {event.mergeMessageBody.message.data.type.replace('MESSAGE_TYPE_', '')}
                      <CopyButton value={event.mergeMessageBody.message.data.type} className="ml-1 flex-shrink-0" />
                    </span>
                  </li>
                  <li className="flex justify-between items-center mb-1">
                    <span className="font-semibold mr-1">fid</span>
                    <span className="flex items-center text-right">
                      {event.mergeMessageBody.message.data.fid}
                      <CopyButton value={event.mergeMessageBody.message.data.fid.toString()} className="ml-1 flex-shrink-0" />
                    </span>
                  </li>
                  <li className="flex justify-between items-center mb-1">
                    <span className="font-semibold mr-1">network</span>
                    <span className="flex items-center text-right">
                      {event.mergeMessageBody.message.data.network.replace('FARCASTER_NETWORK_', '')}
                      <CopyButton value={event.mergeMessageBody.message.data.network} className="ml-1 flex-shrink-0" />
                    </span>
                  </li>
                  <li className="flex justify-between items-center mb-1">
                    <span className="font-semibold mr-1">timestamp</span>
                    <span className="flex items-center text-right">
                      {new Date(event.mergeMessageBody.message.data.timestamp * 1000).toLocaleString()}
                      <CopyButton value={event.mergeMessageBody.message.data.timestamp.toString()} className="ml-1 flex-shrink-0" />
                    </span>
                  </li>
                  <li className="flex justify-between items-start mb-1">
                    <span className="font-semibold mr-1">message hash</span>
                    <span className="flex items-center text-right">
                      <span className="font-mono text-sm">{event.mergeMessageBody.message.hash}</span>
                      <CopyButton value={event.mergeMessageBody.message.hash} className="ml-1 flex-shrink-0" />
                    </span>
                  </li>
                  <li className="flex justify-between items-start mb-1">
                    <span className="font-semibold mr-1">signer</span>
                    <span className="flex items-center text-right">
                      <span className="font-mono text-sm">{event.mergeMessageBody.message.signer}</span>
                      <CopyButton value={event.mergeMessageBody.message.signer} className="ml-1 flex-shrink-0" />
                    </span>
                  </li>
                  {event.mergeMessageBody.message.data.reactionBody && (
                    <>
                      <li className="flex justify-between items-center mb-1">
                        <span className="font-semibold mr-1">reaction type</span>
                        <span className="flex items-center text-right">
                          {event.mergeMessageBody.message.data.reactionBody.type.replace('REACTION_TYPE_', '')}
                          <CopyButton value={event.mergeMessageBody.message.data.reactionBody.type} className="ml-1 flex-shrink-0" />
                        </span>
                      </li>
                      <li className="flex justify-between items-center mb-1">
                        <span className="font-semibold mr-1">target cast fid</span>
                        <span className="flex items-center text-right">
                          {event.mergeMessageBody.message.data.reactionBody.targetCastId.fid}
                          <CopyButton value={event.mergeMessageBody.message.data.reactionBody.targetCastId.fid.toString()} className="ml-1 flex-shrink-0" />
                        </span>
                      </li>
                      <li className="flex justify-between items-start mb-1">
                        <span className="font-semibold mr-1">target cast hash</span>
                        <span className="flex items-center text-right">
                          <span className="font-mono text-sm">{event.mergeMessageBody.message.data.reactionBody.targetCastId.hash}</span>
                          <CopyButton value={event.mergeMessageBody.message.data.reactionBody.targetCastId.hash} className="ml-1 flex-shrink-0" />
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              ) : (
                <p className="text-gray-500">No message data available.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="mt-4">
            <div className="p-2 border border-black">
              <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-2 rounded">
                <code>{JSON.stringify(event, null, 2)}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
