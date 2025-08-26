import { useEventStream } from '@/hooks/useEventStream';
import { useState } from 'react';
import { StatsBoxes } from './StatsBoxes';
import { Skeleton } from './Skeleton';

export function LiveFeed() {
  const { events } = useEventStream();
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 50;
  
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  return (
    <div className="w-full">
      <StatsBoxes />

      <div className="grid grid-cols-12 gap-4 py-3 text-sm font-medium text-gray-600 mb-1 px-6">
        <div className="col-span-2">username</div>
        <div className="col-span-5">content</div>
        <div className="col-span-1">embeds</div>
        <div className="col-span-2">link</div>
        <div className="col-span-2">type</div>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <Skeleton variant="table" rows={8} />
        ) : (
          currentEvents.map((event) => {
            const displayUsername = event.username.startsWith('fid') && event.username !== 'fid' 
              ? event.username.replace('fid', '') 
              : event.username;
            
            return (
              <div 
                key={event.id} 
                className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50 px-6"
              >
                <div className="col-span-2">
                  <span className="text-black cursor-pointer">
                    {displayUsername}
                  </span>
                </div>
                <div className="col-span-5">
                  <span className="text-gray-900">
                    {event.content}
                  </span>
                </div>
                <div className="col-span-1">
                  {event.embeds && event.embeds !== '0' && (
                    <div className="flex items-center justify-center bg-gray-400 w-10 h-10 ml-2">
                      <p className="text-center text-white text-sm">{event.embeds}</p>
                    </div>
                  )}
                </div>
                <div className="col-span-2 md:ml-4">
                  <a 
                    href={event.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#71579E] hover:underline text-sm"
                  >
                    link =&gt;
                  </a>
                </div>
                <div className="col-span-2 text-sm text-gray-500 md:ml-4">
                  {event.type}
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <>
          <div className="border-t border-gray-200 mt-8"></div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, events.length)} of {events.length} events
            </div>
          </div>
        </>
      )}
    </div>
  );
}
