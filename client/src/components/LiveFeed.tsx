import { useEventStream, type StreamEvent } from '@/hooks/useEventStream';
import { useState, useMemo } from 'react';
import { StatsBoxes } from './StatsBoxes';
import { Skeleton } from './Skeleton';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';



export function LiveFeed() {
  const { events } = useEventStream();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });

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
            <span className="text-black cursor-pointer">
              {displayUsername}
            </span>
          );
        },
      },
      {
        accessorKey: 'content',
        header: 'content',
        cell: ({ getValue }) => (
          <span className="text-gray-900 block max-w-full truncate">
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
  });

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const startIndex = table.getState().pagination.pageIndex * table.getState().pagination.pageSize;
  const endIndex = startIndex + table.getState().pagination.pageSize;

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
          <Table className="w-full">
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.original.id}
                  className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50 px-6"
                >
                  <TableCell className="col-span-2 p-0">
                    {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
                  </TableCell>
                  <TableCell className="col-span-5 p-0 overflow-hidden">
                    {flexRender(row.getVisibleCells()[1].column.columnDef.cell, row.getVisibleCells()[1].getContext())}
                  </TableCell>
                  <TableCell className="col-span-1 p-0">
                    {flexRender(row.getVisibleCells()[2].column.columnDef.cell, row.getVisibleCells()[2].getContext())}
                  </TableCell>
                  <TableCell className="col-span-2 p-0 md:ml-4">
                    {flexRender(row.getVisibleCells()[3].column.columnDef.cell, row.getVisibleCells()[3].getContext())}
                  </TableCell>
                  <TableCell className="col-span-2 p-0 md:ml-4">
                    {flexRender(row.getVisibleCells()[4].column.columnDef.cell, row.getVisibleCells()[4].getContext())}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <>
          <div className="border-t border-gray-200 mt-8"></div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
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
