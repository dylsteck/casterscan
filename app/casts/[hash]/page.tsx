"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import useNeynarCast from '@/app/hooks/neynar/use-neynar-cast';
import useWarpcastCast from '@/app/hooks/warpcast/use-warpcast-cast';
import useHubCast, { WARPCAST_HUB_URLS } from '@/app/hooks/hub/use-hub-cast';
import WarpcastIcon from '@/app/components/warpcast-icon';
import CopyClipboardIcon from '@/app/components/copy-clipboard-icon';
import { XCircleIcon } from '@heroicons/react/20/solid';

export default function Hash() {
  const pathname = usePathname();
  const hash = pathname.split('/')[2];
  const { cast: neynarCast, loading: neynarLoading, error: neynarError } = useNeynarCast(hash);
  const { cast: warpcastCast, loading: warpcastLoading, error: warpcastError } = useWarpcastCast(hash);
  
  const [fid, setFid] = useState<number | null>(null);
  const [neynarHubCast, setNeynarHubCast] = useState<any>(null);
  const [neynarHubLoading, setNeynarHubLoading] = useState<boolean>(false);
  const [neynarHubError, setNeynarHubError] = useState<string | null>(null);

  const [warpcastHubCast, setWarpcastHubCast] = useState<any>(null);
  const [warpcastHubLoading, setWarpcastHubLoading] = useState<boolean>(false);
  const [warpcastHubError, setWarpcastHubError] = useState<string | null>(null);

  useEffect(() => {
    if (neynarCast) {
      setFid(neynarCast.author.fid);
    }
  }, [neynarCast]);

  useEffect(() => {
    const fetchHubCast = async (hubType: 'neynar' | 'warpcast') => {
      if (fid && hash) {
        if (hubType === 'neynar') {
          setNeynarHubLoading(true);
          try {
            const response = await fetch(`https://hub-api.neynar.com/v1/castById?fid=${fid}&hash=${hash}`);
            const json = await response.json();
            setNeynarHubCast(json);
            setNeynarHubLoading(false);
          } catch (err) {
            setNeynarHubError('Failed to fetch neynar hub cast');
            setNeynarHubLoading(false);
          }
        } else {
          setWarpcastHubLoading(true);
          try {
            const url = WARPCAST_HUB_URLS[Math.floor(Math.random() * WARPCAST_HUB_URLS.length)];
            const response = await fetch(`${url}/v1/castById?fid=${fid}&hash=${hash}`);
            if (!response.ok) {
              const fallbackUrl = WARPCAST_HUB_URLS.find(u => u !== url);
              const fallbackResponse = await fetch(`${fallbackUrl}/v1/castById?fid=${fid}&hash=${hash}`);
              if (!fallbackResponse.ok) throw new Error('Failed to fetch cast from both Warpcast Hub URLs');
              const json = await fallbackResponse.json();
              setWarpcastHubCast(json);
            } else {
              const json = await response.json();
              setWarpcastHubCast(json);
            }
            setWarpcastHubLoading(false);
          } catch (err) {
            setWarpcastHubError('Failed to fetch warpcast hub cast');
            setWarpcastHubLoading(false);
          }
        }
      }
    };

    if (fid && hash) {
      fetchHubCast('neynar');
      fetchHubCast('warpcast');
    }
  }, [fid, hash]);

  const [showModal, setShowModal] = useState<{ show: boolean, type: 'neynar' | 'warpcast' | 'neynarHub' | 'warpcastHub' }>({ show: false, type: 'neynar' });

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <p className="text-xl font-semibold mt-3">cast details</p>
        <div className="p-2 border border-black relative">
          {neynarLoading && <p>Loading Neynar Cast...</p>}
          {neynarError && <p>{neynarError}</p>}
          {neynarCast && (
            <>
              <Link href={`https://warpcast.com/${neynarCast.author.username}/${hash.slice(0, 10)}`} target="_blank">
                <WarpcastIcon className="absolute top-3 right-2" />
              </Link>
              <div className="flex items-center mb-2">
                <img src={neynarCast.author.pfp_url} alt={`${neynarCast.author.username}'s PFP`} className="w-8 h-8 rounded-full mr-2" />
                <div>
                  <p className="text-lg font-semibold">{neynarCast.author.display_name}</p>
                  <p className="text-sm text-gray-500">@{neynarCast.author.username}</p>
                </div>
              </div>
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold mr-2">cast text</span>
                <div className="flex items-center max-w-full break-words overflow-hidden">
                  <span className="flex-grow break-words">{neynarCast.text}</span>
                  <CopyClipboardIcon value={neynarCast.text} className="ml-2 flex-shrink-0" />
                </div>
              </div>
              <ul className="list-none mt-2">
                {neynarCast.embeds && neynarCast.embeds
                  .filter(embed => embed.url && embed.url !== "N/A")
                  .map((embed, index) => (
                    <li key={`embed-${index}`} className="flex justify-between items-center mb-1">
                      <span className="font-semibold mr-2">{`embed ${index + 1}`}</span>
                      <span className="flex items-center">
                        <Link href={embed.url} className="underline mr-2" target="_blank">
                          {embed.url}
                        </Link>
                        <CopyClipboardIcon value={embed.url} />
                      </span>
                    </li>
                  ))}
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-2">cast hash</span>
                  <span className="flex items-center">
                    {neynarCast.hash}
                    <CopyClipboardIcon value={neynarCast.hash} className="ml-2" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-2">parent cast hash</span>
                  <span className="flex items-center">
                    {neynarCast.thread_hash}
                    <CopyClipboardIcon value={neynarCast.thread_hash} className="ml-2" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-2">username</span>
                  <span className="flex items-center">
                    {neynarCast.author.username}
                    <CopyClipboardIcon value={neynarCast.author.username} className="ml-2" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-2">fid</span>
                  <span className="flex items-center">
                    {neynarCast.author.fid}
                    <CopyClipboardIcon value={neynarCast.author.fid.toString()} className="ml-2" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-2">timestamp</span>
                  <span className="flex items-center">
                    {new Date(neynarCast.timestamp).toLocaleString()}
                    <CopyClipboardIcon value={new Date(neynarCast.timestamp).toLocaleString()} className="ml-2" />
                  </span>
                </li>
              </ul>
              <p className="text-sm font-light mt-2">{neynarCast.replies.count} replies, {neynarCast.reactions.likes_count} likes, and {neynarCast.reactions.recasts_count} recasts</p>
            </>
          )}
        </div>
        <p className="font-medium text-lg">
          response data
        </p>
        <div className="flex flex-row gap-2 items-center">
          <button 
            className="p-2 text-black border border-black" 
            onClick={() => setShowModal({ show: true, type: 'neynar' })}
          >
            neynar api
          </button>
          <button 
            className="p-2 text-black border border-black" 
            onClick={() => setShowModal({ show: true, type: 'warpcast' })}
          >
            warpcast api
          </button>
          <button 
            className="p-2 text-black border border-black" 
            onClick={() => setShowModal({ show: true, type: 'neynarHub' })}
          >
            neynar hub
          </button>
          <button 
            className="p-2 text-black border border-black" 
            onClick={() => setShowModal({ show: true, type: 'warpcastHub' })}
          >
            warpcast hub
          </button>
        </div>
      </div>
      {showModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-medium mb-2">
              {showModal.type === 'neynar' ? 'neynar' : showModal.type === 'warpcast' ? 'warpcast' : showModal.type === 'neynarHub' ? 'neynar hub' : 'warpcast hub'} api response
            </h2>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs h-64">
              {JSON.stringify(showModal.type === 'neynar' ? neynarCast : showModal.type === 'warpcast' ? warpcastCast : showModal.type === 'neynarHub' ? neynarHubCast : warpcastHubCast, null, 2)}
            </pre>
            <div className="mt-2 flex justify-end gap-0.5">
              <div className="pr-1 pt-0.5">
                <CopyClipboardIcon value={JSON.stringify(showModal.type === 'neynar' ? neynarCast : showModal.type === 'warpcast' ? warpcastCast : showModal.type === 'neynarHub' ? neynarHubCast : warpcastHubCast)} />
              </div>
              <XCircleIcon className="w-5 h-5 text-red-500 cursor-pointer" onClick={() => setShowModal({ show: false, type: showModal.type })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}