'use client'

import { useState } from 'react';
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
  const [selectedSigner, setSelectedSigner] = useState<string | null>(null);

  if (selectedSigner) {
    return (
      <SignerDetail 
        signerKey={selectedSigner} 
        fid={fid} 
        onBack={() => setSelectedSigner(null)}
        appInfo={{
          name: app.profile?.display_name || app.profile?.username || `App ${app.fid}`,
          username: app.profile?.username,
          bio: app.profile?.profile?.bio?.text,
          pfpUrl: app.profile?.pfp_url
        }}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <button onClick={onBack} className="text-blue-600 hover:underline mt-3 mb-2 text-left">
          ← Back to {userProfile?.username || `FID ${userProfile?.fid || fid}`}
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          {app.profile?.pfp_url && (
            <img src={app.profile.pfp_url} alt="App" className="w-12 h-12 rounded-full" />
          )}
          <div>
            <h2 className="text-xl font-bold">
              {app.profile?.display_name || app.profile?.username || 'Unknown App'}
            </h2>
            {app.profile?.username && (
              <p className="text-gray-600">@{app.profile.username}</p>
            )}
            {app.profile?.profile?.bio?.text && (
              <p className="text-sm text-gray-500 mt-1">{app.profile.profile.bio.text}</p>
            )}
            <div className="text-sm text-gray-600 mt-2">
              {app.totalMessages.toLocaleString()} messages • {app.signers.length} signers
              {app.lastUsed && ` • Last used ${timeAgo(app.lastUsed)} ago`}
            </div>
          </div>
        </div>

        <p className="text-xl font-semibold">signers</p>
        <div className="p-2 border border-black">
          {app.signers.length > 0 ? (
            <div className="space-y-3">
              {app.signers
                .sort((a, b) => {
                  const aLastUsed = a.messageStats?.lastUsed ? new Date(a.messageStats.lastUsed).getTime() : 0;
                  const bLastUsed = b.messageStats?.lastUsed ? new Date(b.messageStats.lastUsed).getTime() : 0;
                  return bLastUsed - aLastUsed;
                })
                .map((signer, index) => (
                  <div key={index} className="border border-black p-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-xs text-gray-500 mb-1 break-all">
                          {signer.key.slice(0, 20)}...{signer.key.slice(-4)}
                        </div>
                        
                        {signer.messageStats && signer.messageStats.total > 0 ? (
                          <div className="text-sm text-gray-600 mb-1">
                            {signer.messageStats.casts.toLocaleString()} casts • {signer.messageStats.reactions.toLocaleString()} reactions • {signer.messageStats.links.toLocaleString()} links • {signer.messageStats.verifications.toLocaleString()} verifications
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 mb-1">0 messages</div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className={signer.keyType === 1 ? 'text-blue-600' : 'text-gray-600'}>
                            {signer.keyType === 1 ? 'Ed25519' : `Type ${signer.keyType}`}
                          </span>
                          <span className={signer.eventType === 'SIGNER_EVENT_TYPE_ADD' ? 'text-green-600' : 'text-red-600'}>
                            {signer.eventType === 'SIGNER_EVENT_TYPE_ADD' ? 'ADD' : 'REMOVE'}
                          </span>
                          {signer.messageStats?.lastUsed && (
                            <span>Last used {timeAgo(new Date(signer.messageStats.lastUsed))} ago</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created {timeAgo(new Date(signer.blockTimestamp * 1000))} ago
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <CopyClipboardIcon value={signer.key} className="flex-shrink-0" />
                        {signer.messageStats && signer.messageStats.total > 0 && (
                          <button 
                            onClick={() => setSelectedSigner(signer.key)}
                            className="text-blue-600 hover:underline text-xs border border-blue-600 px-1 py-1"
                          >
                            View messages
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
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
