'use client'

import React from 'react';
import CopyClipboardIcon from '@/app/components/custom/copy-clipboard-icon';

interface EventData {
  type: string;
  id: number;
  blockNumber: number;
  shardIndex: number;
  blockConfirmedBody?: {
    blockNumber: number;
    shardIndex: number;
    timestamp: number;
    blockHash: string;
    totalEvents: number;
  };
  // Message data for cast/verification events
  fid?: number;
  timestamp?: number;
  network?: string;
  hash?: string;
  verificationAddAddressBody?: {
    address: string;
    claimSignature: string;
    blockHash: string;
    type: number;
    chainId: number;
    protocol: string;
  };
}

export default function EventDetails({ eventId, shardIndex, eventData }: { 
  eventId: string, 
  shardIndex: string, 
  eventData: EventData | null 
}) {
  if (!eventData) {
    return (
      <div className="w-screen h-screen flex justify-center items-start">
        <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
          <p className="text-xl font-semibold mt-3">event details</p>
          <div className="p-2 border border-black">
            <p className="text-red-600">Event not found</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <p className="text-xl font-semibold mt-3">event details</p>
        <div className="p-2 border border-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
          <ul className="list-none">
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">event id</span>
              <span className="flex items-center text-right">
                {eventData.id}
                <CopyClipboardIcon value={eventData.id.toString()} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">event type</span>
              <span className="flex items-center text-right">
                {eventData.type}
                <CopyClipboardIcon value={eventData.type} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">block number</span>
              <span className="flex items-center text-right">
                {eventData.blockNumber}
                <CopyClipboardIcon value={eventData.blockNumber.toString()} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">shard index</span>
              <span className="flex items-center text-right">
                {eventData.shardIndex}
                <CopyClipboardIcon value={eventData.shardIndex.toString()} className="ml-1 flex-shrink-0" />
              </span>
            </li>

            {eventData.fid && (
              <li className="flex justify-between items-center mb-1">
                <span className="font-semibold mr-1">fid</span>
                <span className="flex items-center text-right">
                  <Link href={`/fids/${eventData.fid}`} className="text-black underline">
                    {eventData.fid}
                  </Link>
                  <CopyClipboardIcon value={eventData.fid.toString()} className="ml-1 flex-shrink-0" />
                </span>
              </li>
            )}

            {eventData.timestamp && (
              <li className="flex justify-between items-center mb-1">
                <span className="font-semibold mr-1">timestamp</span>
                <span className="flex items-center text-right">
                  {eventData.timestamp}
                  <CopyClipboardIcon value={eventData.timestamp.toString()} className="ml-1 flex-shrink-0" />
                </span>
              </li>
            )}

            {eventData.network && (
              <li className="flex justify-between items-center mb-1">
                <span className="font-semibold mr-1">network</span>
                <span className="flex items-center text-right">
                  {eventData.network}
                  <CopyClipboardIcon value={eventData.network} className="ml-1 flex-shrink-0" />
                </span>
              </li>
            )}

            {eventData.hash && (
              <li className="flex justify-between items-center mb-1">
                <span className="font-semibold mr-1">hash</span>
                <span className="flex items-center text-right">
                  <span className="font-mono text-sm break-all">{eventData.hash}</span>
                  <CopyClipboardIcon value={eventData.hash} className="ml-1 flex-shrink-0" />
                </span>
              </li>
            )}

            {eventData.verificationAddAddressBody && (
              <>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">verified address</span>
                  <span className="flex items-center text-right">
                    <span className="font-mono text-sm break-all">{eventData.verificationAddAddressBody.address}</span>
                    <CopyClipboardIcon value={eventData.verificationAddAddressBody.address} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">chain id</span>
                  <span className="flex items-center text-right">
                    {eventData.verificationAddAddressBody.chainId}
                    <CopyClipboardIcon value={eventData.verificationAddAddressBody.chainId.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">protocol</span>
                  <span className="flex items-center text-right">
                    {eventData.verificationAddAddressBody.protocol}
                    <CopyClipboardIcon value={eventData.verificationAddAddressBody.protocol} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">verification type</span>
                  <span className="flex items-center text-right">
                    {eventData.verificationAddAddressBody.type}
                    <CopyClipboardIcon value={eventData.verificationAddAddressBody.type.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">verification block hash</span>
                  <span className="flex items-center text-right">
                    <span className="font-mono text-sm break-all">{eventData.verificationAddAddressBody.blockHash}</span>
                    <CopyClipboardIcon value={eventData.verificationAddAddressBody.blockHash} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
              </>
            )}
            
            {eventData.blockConfirmedBody && (
              <>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">timestamp</span>
                  <span className="flex items-center text-right">
                    {eventData.blockConfirmedBody.timestamp}
                    <CopyClipboardIcon value={eventData.blockConfirmedBody.timestamp.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">block hash</span>
                  <span className="flex items-center text-right">
                    <span className="font-mono text-sm break-all">{eventData.blockConfirmedBody.blockHash}</span>
                    <CopyClipboardIcon value={eventData.blockConfirmedBody.blockHash} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">total events</span>
                  <span className="flex items-center text-right">
                    {eventData.blockConfirmedBody.totalEvents}
                    <CopyClipboardIcon value={eventData.blockConfirmedBody.totalEvents.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="mt-4">
          <p className="text-lg font-semibold mb-2">raw event data</p>
          <div className="p-2 border border-black">
            <div className="relative">
              <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-2 font-mono whitespace-pre-wrap break-words">
                <code>{JSON.stringify(eventData, null, 2)}</code>
              </pre>
              <div className="absolute top-2 right-2">
                <CopyClipboardIcon value={JSON.stringify(eventData, null, 2)} className="flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
