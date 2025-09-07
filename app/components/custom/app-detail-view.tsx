'use client'

import { useState } from 'react';
import { useQueryState } from 'nuqs';
import CopyClipboardIcon from './copy-clipboard-icon';
import { SignerDetail } from './signer-detail';
import { AppWithSigners, formatSignerStats, timeAgo } from '../../lib/signer-helpers';

interface AppDetailViewProps {
  app: AppWithSigners;
  fid: string;
  onBack: () => void;
  userProfile?: {
    username?: string;
    fid?: string;
  };
}

export function AppDetailView({ app, fid, onBack, userProfile }: AppDetailViewProps) {
  const [selectedSignerKey, setSelectedSignerKey] = useQueryState('signer');

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <button onClick={onBack} className="text-black hover:underline mt-3 mb-2 text-left">
          ← back to {userProfile?.username || `FID ${userProfile?.fid || fid}`}
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          {app.profile?.pfp_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={app.profile.pfp_url} alt="App" className="w-12 h-12 rounded-full" />
          )}
          <div>
            <h2 className="text-xl font-bold">
              {app.profile?.display_name || app.profile?.username || `App ${app.fid}`}
            </h2>
            {app.profile?.username && (
              <p className="text-gray-600">
                @<a href={`/usernames/${app.profile.username}`} target="_blank" className="text-black underline">
                  {app.profile.username}
                </a>
              </p>
            )}
            {app.profile?.profile?.bio?.text && (
              <p className="text-sm text-gray-500 mt-1">{app.profile.profile.bio.text}</p>
            )}
            <div className="text-sm text-gray-600 mt-2">
              {app.totalMessages.toLocaleString()} messages • {app.signers.length} signers
              {app.lastUsed && ` • last used ${timeAgo(app.lastUsed)} ago`}
            </div>
          </div>
        </div>

        <p className="text-xl font-semibold">signers</p>
        <div>
          {app.signers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {app.signers
                .sort((a, b) => {
                  const aLastUsed = a.messageStats?.lastUsed ? new Date(a.messageStats.lastUsed).getTime() : 0;
                  const bLastUsed = b.messageStats?.lastUsed ? new Date(b.messageStats.lastUsed).getTime() : 0;
                  return bLastUsed - aLastUsed;
                })
                .map((signer, index) => (
                  <button
                    key={index}
                    onClick={() => signer.messageStats && signer.messageStats.total > 0 ? setSelectedSignerKey(signer.key) : undefined}
                    className={`border border-black p-2 text-left w-full ${signer.messageStats && signer.messageStats.total > 0 ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="font-mono text-xs text-gray-500 break-all mb-2">
                      {signer.key.slice(0, 20)}...{signer.key.slice(-4)}
                    </div>
                    
                    {signer.messageStats && signer.messageStats.total > 0 ? (
                      <div className="text-sm mb-2">
                        {signer.messageStats.total.toLocaleString()} messages
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mb-2">0 messages</div>
                    )}

                    {signer.messageStats && signer.messageStats.total > 0 && (
                      <>
                        <div className="text-xs text-gray-500 mb-1">
                          - {signer.messageStats.casts.toLocaleString()} casts
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          - {signer.messageStats.reactions.toLocaleString()} reactions
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          - {signer.messageStats.links.toLocaleString()} links
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          - {signer.messageStats.verifications.toLocaleString()} verifications
                        </div>
                      </>
                    )}
                    
                    {signer.messageStats?.lastUsed && (
                      <div className="text-xs text-gray-500 mb-2">
                        last used {timeAgo(new Date(signer.messageStats.lastUsed))} ago
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>created {timeAgo(new Date(signer.blockTimestamp * 1000))} ago</span>
                      <div className="flex items-center gap-2 text-black">
                        <span>
                          {signer.keyType === 1 ? 'ed25519' : `type ${signer.keyType}`}
                        </span>
                        <span>
                          {signer.eventType === 'SIGNER_EVENT_TYPE_ADD' ? 'add' : 'remove'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No signers found for this app.</p>
          )}
        </div>
      </div>
    </div>
  );
}
