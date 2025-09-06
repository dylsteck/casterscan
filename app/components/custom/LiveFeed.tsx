import { useEventStream, type StreamEvent } from '../../hooks/useEventStream';
import { useInfo } from '../../hooks/useInfo';
import { useState, useMemo, useEffect } from 'react';
import { Skeleton } from '../Skeleton';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table';

export function LiveFeed() {
  const { events } = useEventStream();
  const { info, isLoading: infoLoading } = useInfo();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });
  const [lastEventCount, setLastEventCount] = useState(0);
  const [hasNewData, setHasNewData] = useState(false);

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
        accessorKey: 'username',
        header: 'username',
        cell: ({ getValue }) => {
          const username = getValue() as string;
          const displayUsername = username.startsWith('fid') && username !== 'fid' 
            ? username.replace('fid', '') 
            : username;
          return (
            <span className="text-black cursor-pointer block truncate max-w-full">
              {displayUsername}
            </span>
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
        accessorKey: 'embeds',
        header: 'embeds',
        cell: ({ getValue }) => {
          const embeds = getValue() as string | undefined;
          return embeds && parseInt(embeds) > 0 ? (
            <div className="flex items-center justify-center bg-gray-400 w-10 h-10 ml-2">
              <p className="text-center text-white text-sm">{embeds}</p>
            </div>
          ) : null;
        },
      },
      {
        accessorKey: 'link',
        header: 'link',
        cell: ({ getValue }) => (
          <a 
            href={getValue() as string} 
            target="_blank" 
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

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B'
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1000000000) {
      return (bytes / 1000000000).toFixed(1) + 'GB'
    }
    if (bytes >= 1000000) {
      return (bytes / 1000000).toFixed(1) + 'MB'
    }
    if (bytes >= 1000) {
      return (bytes / 1000).toFixed(1) + 'KB'
    }
    return bytes + 'B'
  }

  return (
    <div className="w-full">
      {/* Stats Section */}
      {infoLoading ? (
        <Skeleton variant="stats" />
      ) : info ? (
        <div className="flex md:grid md:grid-cols-6 gap-0 overflow-x-auto">
          <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0">
            <div className="text-sm text-gray-500 mb-1">TOTAL MESSAGES</div>
            <div className="text-xl font-semibold text-gray-900">{formatNumber(info.dbStats.numMessages)}</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0">
            <div className="text-sm text-gray-500 mb-1">TOTAL FIDS</div>
            <div className="text-xl font-semibold text-gray-900">{formatNumber(info.dbStats.numFidRegistrations)}</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0">
            <div className="text-sm text-gray-500 mb-1">DB SIZE</div>
            <div className="text-xl font-semibold text-gray-900">{formatBytes(info.dbStats.approxSize)}</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0">
            <div className="text-sm text-gray-500 mb-1">SHARD 1 HEIGHT</div>
            <div className="text-xl font-semibold text-gray-900">{formatNumber(info.shardInfos[1]?.maxHeight || 0)}</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0">
            <div className="text-sm text-gray-500 mb-1">SHARD 2 HEIGHT</div>
            <div className="text-xl font-semibold text-gray-900">{formatNumber(info.shardInfos[2]?.maxHeight || 0)}</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0">
            <div className="text-sm text-gray-500 mb-1">VERSION</div>
            <div className="text-xl font-semibold text-gray-900">{info.version}</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-0">
          <div className="border border-gray-300 p-4 bg-white">
            <div className="text-sm text-gray-500 mb-1">STATUS</div>
            <div className="text-xl font-semibold text-gray-400">Error</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white">
            <div className="text-sm text-gray-500 mb-1">CONNECTION</div>
            <div className="text-xl font-semibold text-gray-400">Failed</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white">
            <div className="text-sm text-gray-500 mb-1">RETRY</div>
            <div className="text-xl font-semibold text-gray-400">Auto</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white">
            <div className="text-sm text-gray-500 mb-1">SOURCE</div>
            <div className="text-xl font-semibold text-gray-400">Snapchain</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white">
            <div className="text-sm text-gray-500 mb-1">WAITING</div>
            <div className="text-xl font-semibold text-gray-400">...</div>
          </div>
          <div className="border border-gray-300 p-4 bg-white">
            <div className="text-sm text-gray-500 mb-1">VERSION</div>
            <div className="text-xl font-semibold text-gray-400">---</div>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 py-3 text-sm font-medium text-gray-600 px-6 border-b bg-white">
        <div className="col-span-2">username</div>
        <div className="col-span-5">content</div>
        <div className="col-span-1">embeds</div>
        <div className="col-span-2">link</div>
        <div className="col-span-2">type</div>
      </div>

      {/* Table Content */}
      <div className="bg-white border">
        {events.length === 0 ? (
          <Skeleton variant="table" rows={8} />
        ) : (
          <div className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <div 
                key={row.original.id}
                className="grid grid-cols-12 gap-4 py-3 hover:bg-gray-50 px-6"
              >
                <div className="col-span-2 overflow-hidden">
                  {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
                </div>
                <div className="col-span-5 overflow-hidden">
                  {flexRender(row.getVisibleCells()[1].column.columnDef.cell, row.getVisibleCells()[1].getContext())}
                </div>
                <div className="col-span-1">
                  {flexRender(row.getVisibleCells()[2].column.columnDef.cell, row.getVisibleCells()[2].getContext())}
                </div>
                <div className="col-span-2">
                  {flexRender(row.getVisibleCells()[3].column.columnDef.cell, row.getVisibleCells()[3].getContext())}
                </div>
                <div className="col-span-2">
                  {flexRender(row.getVisibleCells()[4].column.columnDef.cell, row.getVisibleCells()[4].getContext())}
                </div>
              </div>
            ))}
          </div>
        )}
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
