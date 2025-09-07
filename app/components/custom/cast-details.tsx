import Link from 'next/link';
import React from 'react';
import CopyClipboardIcon from '@/app/components/custom/copy-clipboard-icon';
import ShareCast from './share-cast';
import { NeynarV2Cast } from '../../lib/types';
import ResponseData from './response-data';
import NeynarApiResponseData from './response-data/neynar-api-response-data';
import FarcasterApiResponseData from './response-data/farcaster-api-response-data';
import NeynarHubResponseData from './response-data/neynar-hub-response-data';
import FarcasterHubResponseData from './response-data/farcaster-hub-response-data';

export default function CastDetails({ hash, neynarCast }: { hash: string, neynarCast: NeynarV2Cast }) {
  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <p className="text-xl font-semibold mt-3">cast details</p>
        <div className="p-2 border border-black relative" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
          <div className="absolute top-3 right-2 flex items-center">
            <ShareCast neynarCast={neynarCast}/>
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
                <a href={`/fids/${neynarCast.author.fid}`} className="underline">
                  {neynarCast.author.fid}
                </a>
                <CopyClipboardIcon value={neynarCast.author.fid.toString()} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">app name</span>
              <span className="flex items-center text-right">
                <div className="flex flex-row gap-1.5 items-center">
                  <img src={neynarCast.app.pfp_url} className="size-4 rounded-full" alt={`PFP for ${neynarCast.app.display_name}`} />
                  <span>
                    {neynarCast.app.display_name}
                  </span>
                </div>
                <CopyClipboardIcon value={neynarCast.app.display_name} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">app fid</span>
              <span className="flex items-center text-right">
                {neynarCast.app.fid}
                <CopyClipboardIcon value={neynarCast.app.fid.toString()} className="ml-1 flex-shrink-0" />
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
        </div>
        <p className="font-medium text-lg">
          response data
        </p>
        <div className="flex flex-row gap-2 items-center">
          <NeynarApiResponseData neynarCast={neynarCast} />
          <FarcasterApiResponseData hash={hash} />
          <NeynarHubResponseData fid={neynarCast.author.fid} hash={hash} />
          <FarcasterHubResponseData fid={neynarCast.author.fid} hash={hash} />
        </div>
      </div>
    </div>
  );
}