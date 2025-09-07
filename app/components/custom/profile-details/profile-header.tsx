'use client'

import React from 'react';
import { NeynarV2User } from '../../../lib/types';

interface ProfileHeaderProps {
  neynarUser: NeynarV2User;
  appsLoading: boolean;
  totalStats: {
    casts: number;
    reactions: number;
    links: number;
    verifications: number;
  } | null;
}

export function ProfileHeader({ neynarUser, appsLoading, totalStats }: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4 mt-6 mb-4">
      <img src={neynarUser.pfp_url} alt={`${neynarUser.username}'s PFP`} className="w-16 h-16 rounded-full" />
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{neynarUser.display_name}</h1>
        <p className="text-gray-600">@{neynarUser.username}</p>
        {neynarUser.profile?.bio?.text && (
          <p className="text-sm text-gray-500 mt-1">{neynarUser.profile.bio.text}</p>
        )}
        
        {appsLoading ? (
          <div className="animate-pulse mt-2">
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        ) : totalStats ? (
          <div className="text-sm text-gray-600 mt-2">
            {totalStats.casts.toLocaleString()} casts • {totalStats.reactions.toLocaleString()} reactions • {totalStats.links.toLocaleString()} links • {totalStats.verifications.toLocaleString()} verifications
          </div>
        ) : null}
      </div>
    </div>
  );
}
