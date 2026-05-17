'use client'

import React from 'react';
import type { HypersnapV2User } from '../../../lib/types';

interface ProfileHeaderProps {
  hypersnapUser: HypersnapV2User;
  appsLoading: boolean;
  totalStats: {
    casts: number;
    reactions: number;
    links: number;
    verifications: number;
  } | null;
}

export function ProfileHeader({ hypersnapUser, appsLoading, totalStats }: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4 mt-6 mb-4">
      <img src={hypersnapUser.pfp_url} alt={`${hypersnapUser.username}'s PFP`} className="w-16 h-16 rounded-full" />
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{hypersnapUser.display_name}</h1>
        <p className="text-gray-600">@{hypersnapUser.username}</p>
        {hypersnapUser.profile?.bio?.text && (
          <p className="text-sm text-gray-500 mt-1">{hypersnapUser.profile.bio.text}</p>
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
