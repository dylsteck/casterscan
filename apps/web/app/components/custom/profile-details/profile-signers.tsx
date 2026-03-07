'use client'

import React from 'react';
import { timeAgo, AppWithSigners } from '../../../lib/signer-helpers';

interface ProfileSignersProps {
  appsWithSigners: AppWithSigners[] | undefined;
  appsLoading: boolean;
  appsError: Error | null;
  onAppSelect: (appFid: string) => void;
}

export function ProfileSigners({ appsWithSigners, appsLoading, appsError, onAppSelect }: ProfileSignersProps) {
  if (appsLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      </div>
    );
  }

  if (appsError) {
    return <p className="text-red-600">Failed to load signers data</p>;
  }

  if (!appsWithSigners || appsWithSigners.length === 0) {
    return <p className="text-gray-500">No apps with signers found for this FID.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {appsWithSigners.map((app, index) => (
        <button
          key={index}
          onClick={() => onAppSelect(app.fid.toString())}
          className="text-left p-2 border border-black hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            {app.profile?.pfp_url && (
              <img src={app.profile.pfp_url} alt="App" className="w-6 h-6 rounded-full" />
            )}
            <div>
              <div className="font-semibold">
                {app.profile?.display_name || app.profile?.username || `App ${app.fid}`}
              </div>
              <div className="text-gray-500 text-sm">
                @{app.profile?.username || `fid${app.fid}`}
              </div>
            </div>
          </div>
          
          {app.profile?.profile?.bio?.text && (
            <div className="text-xs text-gray-500 mb-2">
              {app.profile.profile.bio.text.length > 80 
                ? `${app.profile.profile.bio.text.slice(0, 80)}...` 
                : app.profile.profile.bio.text}
            </div>
          )}
          
          <div className="text-sm mb-1">
            {app.totalMessages.toLocaleString()} messages
          </div>
          <div className="text-xs text-gray-500 mb-2">
            - {(app.appStats?.casts || 0).toLocaleString()} casts
          </div>
          <div className="text-xs text-gray-500 mb-2">
            - {(app.appStats?.reactions || 0).toLocaleString()} reactions
          </div>
          <div className="text-xs text-gray-500 mb-2">
            - {(app.appStats?.links || 0).toLocaleString()} links
          </div>
          <div className="text-xs text-gray-500 mb-2">
            - {(app.appStats?.verifications || 0).toLocaleString()} verifications
          </div>
          
          <div className="w-full text-right mt-auto">
            <div>{app.signers.length} {app.signers.length === 1 ? 'signer' : 'signers'}</div>
            <div className="text-gray-500">
              {app.lastUsed ? (
                <div>last used {timeAgo(app.lastUsed)} ago</div>
              ) : (
                <div>Never used</div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
