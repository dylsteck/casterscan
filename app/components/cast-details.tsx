"use client";
import Link from 'next/link';
import React from 'react';
import useNeynarCast from '@/app/hooks/neynar/use-neynar-cast';
import useWarpcastCast from '@/app/hooks/warpcast/use-warpcast-cast';
import useHubCast from '@/app/hooks/hub/use-hub-cast';
import CopyClipboardIcon from '@/app/components/copy-clipboard-icon';
import { XCircleIcon } from '@heroicons/react/20/solid';
import ShareCast from './share-cast';

export default function CastDetails({ hash }: { hash: string }) {
  const { cast: neynarCast, loading: neynarLoading, error: neynarError } = useNeynarCast(hash, 'hash');
  const { cast: warpcastCast, loading: warpcastLoading, error: warpcastError } = useWarpcastCast(hash);

  const [fid, setFid] = React.useState<number | null>(null);
  const { cast: neynarHubCast, loading: neynarHubLoading, error: neynarHubError } = useHubCast(fid, hash, 'neynar');
  const { cast: warpcastHubCast, loading: warpcastHubLoading, error: warpcastHubError } = useHubCast(fid, hash, 'warpcast');

  React.useEffect(() => {
    if (neynarCast) {
      setFid(neynarCast.author.fid);
    }
  }, [neynarCast]);

  const [showModal, setShowModal] = React.useState<{ show: boolean, type: 'neynar' | 'warpcast' | 'neynarHub' | 'warpcastHub' }>({ show: false, type: 'neynar' });

  const [selectedOption, setSelectedOption] = React.useState("view on warpcast");

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <p className="text-xl font-semibold mt-3">cast details</p>
        <div className="p-2 border border-black relative" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
          {neynarLoading && <p>Loading Neynar Cast...</p>}
          {neynarError && <p>{neynarError}</p>}
          {neynarCast && (
            <>
              <div className="absolute top-3 right-2 flex items-center">
                <ShareCast 
                  selectedOption={selectedOption} 
                  setSelectedOption={setSelectedOption}
                  neynarCast={neynarCast}
                />
              </div>
              <div className="flex items-center mb-1">
                <img src={neynarCast.author.pfp_url} alt={`${neynarCast.author.username}'s PFP`} className="w-8 h-8 rounded-full mr-1" />
                <div>
                  <p className="text-lg font-semibold">{neynarCast.author.display_name}</p>
                  <p className="text-sm text-gray-500">@{neynarCast.author.username}</p>
                </div>
              </div>
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold mr-1">cast text</span>
                <div className="flex items-center justify-end max-w-[90%] break-words overflow-hidden w-auto">
                  <span className="flex-grow text-right">{neynarCast.text}</span>
                  <CopyClipboardIcon value={neynarCast.text} className="ml-1 flex-shrink-0" />
                </div>
              </div>
              <ul className="list-none mt-1">
                {neynarCast.embeds && neynarCast.embeds
                  .filter(embed => embed.url && embed.url !== "N/A")
                  .map((embed, index) => (
                    <li key={`embed-${index}`} className="flex justify-between items-center mb-1">
                      <span className="font-semibold mr-1">{`embed ${index + 1}`}</span>
                      <div className="flex items-center justify-end text-right w-full">
                        <Link href={embed.url} className="underline text-wrap max-w-[65%] break-all" target="_blank">
                          {embed.url}
                        </Link>
                        <CopyClipboardIcon value={embed.url} className="ml-1 flex-shrink-0" />
                      </div>
                    </li>
                  ))}
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">cast hash</span>
                  <span className="flex items-center text-right">
                    {neynarCast.hash}
                    <CopyClipboardIcon value={neynarCast.hash} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">parent cast hash</span>
                  <span className="flex items-center text-right">
                    {neynarCast.thread_hash}
                    <CopyClipboardIcon value={neynarCast.thread_hash} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">username</span>
                  <span className="flex items-center text-right">
                    {neynarCast.author.username}
                    <CopyClipboardIcon value={neynarCast.author.username} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">fid</span>
                  <span className="flex items-center text-right">
                    {neynarCast.author.fid}
                    <CopyClipboardIcon value={neynarCast.author.fid.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">timestamp</span>
                  <span className="flex items-center text-right">
                    {new Date(neynarCast.timestamp).toLocaleString()}
                    <CopyClipboardIcon value={new Date(neynarCast.timestamp).toLocaleString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
              </ul>
              <p className="text-sm font-light mt-1 text-right">{neynarCast.replies.count} replies, {neynarCast.reactions.likes_count} likes, and {neynarCast.reactions.recasts_count} recasts</p>
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
          <div className="bg-white p-4 rounded shadow-lg max-w-3xl w-full h-[80vh] flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-medium mb-2">
                {showModal.type === 'neynar' ? 'neynar api' : showModal.type === 'warpcast' ? 'warpcast api' : showModal.type === 'neynarHub' ? 'neynar hub' : 'warpcast hub'} response
              </h2>
              <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs h-[65vh]">
                {JSON.stringify(showModal.type === 'neynar' ? neynarCast : showModal.type === 'warpcast' ? warpcastCast : showModal.type === 'neynarHub' ? neynarHubCast : warpcastHubCast, null, 2)}
              </pre>
            </div>
            <div className="flex flex-row justify-end items-center gap-0.5">
              <CopyClipboardIcon value={JSON.stringify(showModal.type === 'neynar' ? neynarCast : showModal.type === 'warpcast' ? warpcastCast : showModal.type === 'neynarHub' ? neynarHubCast : warpcastHubCast)} />
              <XCircleIcon className="w-5 h-5 text-red-500 cursor-pointer" onClick={() => setShowModal({ show: false, type: showModal.type })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}