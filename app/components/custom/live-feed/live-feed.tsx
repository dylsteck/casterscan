import { useEventStream, type StreamEvent } from '../../../hooks/use-event-stream';
import { useInfo } from '../../../hooks/use-info';
import { useState, useMemo, useEffect } from 'react';
import { Skeleton } from '../Skeleton';
import { LiveFeedStats } from './live-feed-stats';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table';

export function LiveFeed() {
  const { events } = useEventStream();
  const { info, isLoading: infoLoading, error: infoError } = useInfo();
  const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [lastEventCount, setLastEventCount] = useState<number>(0);
  const [hasNewData, setHasNewData] = useState<boolean>(false);

  // Track when new events arrive and maintain current page
  useEffect(() => {
    if (events.length > lastEventCount && lastEventCount > 0) {
      // New events arrived, show indicator if not on first page
      if (pagination.pageIndex > 0) {
        setHasNewData(true);
      }
      setLastEventCount(events.length);
    } else if (events.length !== lastEventCount) {
      // Initial load or major change
      setLastEventCount(events.length);
      setHasNewData(false);
    }
  }, [events.length, lastEventCount, pagination.pageIndex]);

  // Clear new data indicator when user goes back to first page
  useEffect(() => {
    if (pagination.pageIndex === 0) {
      setHasNewData(false);
    }
  }, [pagination.pageIndex]);

  const columns = useMemo<ColumnDef<StreamEvent, any>[]>(
    () => [
      {
        accessorKey: 'fid',
        header: 'fid',
        cell: ({ getValue }) => {
          const fid = getValue() as number;
          return (
            <a href={`/fids/${fid}`} className="text-[#71579E] hover:underline cursor-pointer block truncate max-w-full">
              {fid}
            </a>
          );
        },
      },
      {
        accessorKey: 'content',
        header: 'content',
        cell: ({ getValue }) => (
          <span className="text-gray-900 block truncate max-w-full">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'link',
        header: 'link',
        cell: ({ getValue }) => (
          <a 
            href={getValue() as string}
            rel="noopener noreferrer"
            className="text-[#71579E] hover:underline text-sm"
          >
            link =&gt;
          </a>
        ),
      },
      {
        accessorKey: 'type',
        header: 'type',
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-500">
            {getValue() as string}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    // Prevent pagination reset when data changes
    autoResetPageIndex: false,
    // Keep the same page when new data is added
    manualPagination: false,
  });

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const startIndex = table.getState().pagination.pageIndex * table.getState().pagination.pageSize;
  const endIndex = startIndex + table.getState().pagination.pageSize;


  return (
    <div className="w-full">
      <LiveFeedStats info={info} isLoading={infoLoading} />

      {/* Table Container - Scrollable on mobile */}
      <div className="overflow-x-auto md:overflow-x-visible">
        {/* Table Header */}
        <div className="grid grid-cols-11 gap-4 py-3 text-sm font-medium text-gray-600 px-6 border-b bg-white min-w-[800px] md:min-w-0">
          <div className="col-span-2">fid</div>
          <div className="col-span-5">content</div>
          <div className="col-span-2">link</div>
          <div className="col-span-2">type</div>
        </div>

        {/* Table Content */}
        <div className="bg-white border min-w-[800px] md:min-w-0">
          {events.length === 0 ? (
            <Skeleton variant="table" rows={8} />
          ) : (
            <div className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <div 
                  key={row.original.id}
                  className="grid grid-cols-11 gap-4 py-3 hover:bg-gray-50 px-6"
                >
                  <div className="col-span-2 overflow-hidden">
                    {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
                  </div>
                  <div className="col-span-5 overflow-hidden">
                    {flexRender(row.getVisibleCells()[1].column.columnDef.cell, row.getVisibleCells()[1].getContext())}
                  </div>
                  <div className="col-span-2">
                    {flexRender(row.getVisibleCells()[2].column.columnDef.cell, row.getVisibleCells()[2].getContext())}
                  </div>
                  <div className="col-span-2">
                    {flexRender(row.getVisibleCells()[3].column.columnDef.cell, row.getVisibleCells()[3].getContext())}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <>
          <div className="border-t border-gray-200"></div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                previous
              </button>
              <span className="text-sm text-gray-600">
                page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                next
              </button>
            </div>
            <div className="text-sm text-gray-500">
              showing {startIndex + 1}-{Math.min(endIndex, events.length)} of {events.length} events
            </div>
          </div>
        </>
      )}
    </div>
  );
}
