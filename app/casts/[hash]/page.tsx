"use client"
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import useNeynarCast from '@/app/hooks/neynar/use-neynar-cast';
import useWarpcastCast from '@/app/hooks/warpcast/use-warpcast-cast';

export default function Hash() {
  const pathname = usePathname();
  const hash = pathname.split('/')[2];
  const { cast: neynarCast, loading: neynarLoading, error: neynarError } = useNeynarCast(hash);
  const { cast: warpcastCast, loading: warpcastLoading, error: warpcastError } = useWarpcastCast(hash);

  const [showModal, setShowModal] = useState<{ show: boolean, type: 'neynar' | 'warpcast' }>({ show: false, type: 'neynar' });

  const handleCopy = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[80%] flex flex-col gap-2">
        <p className="text-xl font-bold mt-3">cast details</p>
        <div className="p-2 h-[60%] border border-black">
          {neynarLoading && <p>Loading Neynar Cast...</p>}
          {neynarError && <p>{neynarError}</p>}
          {neynarCast && (
            <>
              <div className="flex items-center mb-2">
                <img src={neynarCast.author.pfp_url} alt={`${neynarCast.author.username}'s PFP`} className="w-8 h-8 rounded-full mr-2" />
                <div>
                  <p className="text-lg font-semibold">{neynarCast.author.display_name}</p>
                  <p className="text-sm text-gray-500">@{neynarCast.author.username}</p>
                </div>
              </div>
              <p>{neynarCast.text}</p>
              <p className="text-sm font-light">{neynarCast.replies.count} replies, {neynarCast.reactions.likes_count} likes, and {neynarCast.reactions.recasts_count} recasts</p>
              {neynarCast.embeds && neynarCast.embeds.length > 0 && (
                <div className="flex mt-2 space-x-2">
                  {neynarCast.embeds.map((embed, index) => (
                    <img key={index} src={embed.url} alt={`Embed ${index}`} className="w-20 h-20 object-cover" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {/* TODO: add embeds table here to see relevant links / stats */}
        <div className="flex flex-row gap-2 items-center">
          <button 
            className="p-2 text-black border border-black" 
            onClick={() => setShowModal({ show: true, type: 'neynar' })}
          >
            Neynar API
          </button>
          <button 
            className="p-2 text-black border border-black" 
            onClick={() => setShowModal({ show: true, type: 'warpcast' })}
          >
            Warpcast API
          </button>
        </div>
      </div>

      {showModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">{showModal.type === 'neynar' ? 'Neynar' : 'Warpcast'} API Response</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs h-64">
              {JSON.stringify(showModal.type === 'neynar' ? neynarCast : warpcastCast, null, 2)}
            </pre>
            <div className="mt-2 flex justify-end gap-2">
              <button 
                className="p-2 bg-gray-300 rounded" 
                onClick={() => setShowModal({ show: false, type: 'neynar' })}
              >
                Close
              </button>
              <button 
                className="p-2 bg-blue-500 text-white rounded" 
                onClick={() => handleCopy(showModal.type === 'neynar' ? neynarCast : warpcastCast)}
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}