import React from 'react';
import CopyClipboardIcon from '@/app/components/custom/copy-clipboard-icon';
import ShareCast from './share-cast';
import type { HypersnapV2Cast } from '../../lib/types';
import HypersnapApiResponseData from './response-data/hypersnap-api-response-data';
import FarcasterApiResponseData from './response-data/farcaster-api-response-data';
import HypersnapHubResponseData from './response-data/hypersnap-hub-response-data';
import FarcasterHubResponseData from './response-data/farcaster-hub-response-data';

export default function CastDetails({ hash, hypersnapCast }: { hash: string; hypersnapCast: HypersnapV2Cast }) {
  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <p className="text-xl font-semibold mt-3">cast details</p>
        <div className="p-2 border border-black relative" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
          <div className="absolute top-3 right-2 flex items-center">
            <ShareCast hypersnapCast={hypersnapCast}/>
          </div>
          <div className="flex items-center mb-1">
            <img src={hypersnapCast.author.pfp_url} alt={`${hypersnapCast.author.username}'s PFP`} className="w-8 h-8 rounded-full mr-1" />
            <div>
              <p className="text-lg font-semibold">{hypersnapCast.author.display_name}</p>
              <p className="text-sm text-gray-500">@{hypersnapCast.author.username}</p>
            </div>
          </div>
          <div className="flex justify-between items-start mb-1">
            <span className="font-semibold mr-1">cast text</span>
            <div className="flex items-center justify-end max-w-[90%] break-words overflow-hidden w-auto">
              <span className="flex-grow text-right">{hypersnapCast.text}</span>
              <CopyClipboardIcon value={hypersnapCast.text} className="ml-1 flex-shrink-0" />
            </div>
          </div>
          <ul className="list-none mt-1">
            {hypersnapCast.embeds && hypersnapCast.embeds
              .filter(embed => embed.url && embed.url !== "N/A")
              .map((embed, index) => (
                <li key={`embed-${index}`} className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">{`embed ${index + 1}`}</span>
                  <div className="flex items-center justify-end text-right w-full">
                    <a href={embed.url} className="underline text-wrap max-w-[65%] break-all" target="_blank" rel="noreferrer">
                      {embed.url}
                    </a>
                    <CopyClipboardIcon value={embed.url} className="ml-1 flex-shrink-0" />
                  </div>
                </li>
              ))}
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">cast hash</span>
              <span className="flex items-center text-right">
                {hypersnapCast.hash}
                <CopyClipboardIcon value={hypersnapCast.hash} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">thread hash</span>
              <span className="flex items-center text-right">
                {hypersnapCast.thread_hash ?? "—"}
                <CopyClipboardIcon value={hypersnapCast.thread_hash ?? ""} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">username</span>
              <span className="flex items-center text-right">
                {hypersnapCast.author.username}
                <CopyClipboardIcon value={hypersnapCast.author.username} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">fid</span>
              <span className="flex items-center text-right">
                <a href={`/fids/${hypersnapCast.author.fid}`} className="underline">
                  {hypersnapCast.author.fid}
                </a>
                <CopyClipboardIcon value={hypersnapCast.author.fid.toString()} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            {hypersnapCast.app && (
              <>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">app name</span>
                  <span className="flex items-center text-right">
                    <div className="flex flex-row gap-1.5 items-center">
                      <img src={hypersnapCast.app.pfp_url} className="size-4 rounded-full" alt={`PFP for ${hypersnapCast.app.display_name}`} />
                      <span>
                        {hypersnapCast.app.display_name}
                      </span>
                    </div>
                    <CopyClipboardIcon value={hypersnapCast.app.display_name} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">app fid</span>
                  <span className="flex items-center text-right">
                    <a href={`/fids/${hypersnapCast.app.fid}`} className="underline">
                      {hypersnapCast.app.fid}
                    </a>
                    <CopyClipboardIcon value={hypersnapCast.app.fid.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
              </>
            )}
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">timestamp</span>
              <span className="flex items-center text-right">
                {new Date(hypersnapCast.timestamp).toLocaleString()}
                <CopyClipboardIcon value={new Date(hypersnapCast.timestamp).toLocaleString()} className="ml-1 flex-shrink-0" />
              </span>
            </li>
          </ul>
          <p className="text-sm font-light mt-1 text-right">{hypersnapCast.replies.count} replies, {hypersnapCast.reactions.likes_count} likes, and {hypersnapCast.reactions.recasts_count} recasts</p>
        </div>
        <p className="font-medium text-lg">
          response data
        </p>
        <div className="flex flex-row gap-2 items-center">
          <HypersnapApiResponseData hypersnapCast={hypersnapCast} />
          <FarcasterApiResponseData hash={hash} />
          <HypersnapHubResponseData fid={hypersnapCast.author.fid} hash={hash} />
          <FarcasterHubResponseData fid={hypersnapCast.author.fid} hash={hash} />
        </div>
      </div>
    </div>
  );
}
