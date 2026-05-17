'use client'

import React from 'react';
import CopyClipboardIcon from '../copy-clipboard-icon';
import type { HypersnapV2User } from '../../../lib/types';

interface ProfileOverviewProps {
  hypersnapUser: HypersnapV2User;
}

export function ProfileOverview({ hypersnapUser }: ProfileOverviewProps) {
  return (
    <div className="p-2 border border-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
      <ul className="list-none">
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">username</span>
          <span className="flex items-center text-right">
            {hypersnapUser.username}
            <CopyClipboardIcon value={hypersnapUser.username} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">fid</span>
          <span className="flex items-center text-right">
            {hypersnapUser.fid}
            <CopyClipboardIcon value={hypersnapUser.fid.toString()} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">custody address</span>
          <span className="flex items-center text-right">
            {hypersnapUser.custody_address}
            <CopyClipboardIcon value={hypersnapUser.custody_address} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">follower count</span>
          <span className="flex items-center text-right">
            {hypersnapUser.follower_count.toLocaleString()}
            <CopyClipboardIcon value={hypersnapUser.follower_count.toString()} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">following count</span>
          <span className="flex items-center text-right">
            {hypersnapUser.following_count.toLocaleString()}
            <CopyClipboardIcon value={hypersnapUser.following_count.toString()} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        {hypersnapUser.url && (
          <li className="flex justify-between items-start mb-1">
            <span className="font-semibold mr-1">url</span>
            <span className="flex items-center text-right max-w-[70%]">
              <a href={hypersnapUser.url} target="_blank" rel="noopener noreferrer" className="text-black underline break-all" title={hypersnapUser.url}>
                {hypersnapUser.url}
              </a>
              <CopyClipboardIcon value={hypersnapUser.url} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        <li className="flex justify-between items-start mb-1">
          <span className="font-semibold mr-1">pfp url</span>
          <span className="flex items-center text-right max-w-[70%]">
            <a href={hypersnapUser.pfp_url} target="_blank" rel="noopener noreferrer" className="text-black underline break-all font-mono text-sm" title={hypersnapUser.pfp_url}>
              {hypersnapUser.pfp_url}
            </a>
            <CopyClipboardIcon value={hypersnapUser.pfp_url} className="ml-1 flex-shrink-0" />
          </span>
        </li>

        {hypersnapUser.profile?.banner?.url && (
          <li className="flex justify-between items-start mb-1">
            <span className="font-semibold mr-1">banner url</span>
            <span className="flex items-center text-right max-w-[70%]">
              <a href={hypersnapUser.profile.banner.url} target="_blank" rel="noopener noreferrer" className="text-black underline break-all font-mono text-sm" title={hypersnapUser.profile.banner.url}>
                {hypersnapUser.profile.banner.url}
              </a>
              <CopyClipboardIcon value={hypersnapUser.profile.banner.url} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        {hypersnapUser.verified_addresses?.primary?.eth_address && (
          <li className="flex justify-between items-center mb-1">
            <span className="font-semibold mr-1">primary eth address</span>
            <span className="flex items-center text-right">
              <span className="font-mono text-sm break-all">{hypersnapUser.verified_addresses.primary.eth_address}</span>
              <CopyClipboardIcon value={hypersnapUser.verified_addresses.primary.eth_address} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        {hypersnapUser.verified_addresses?.primary?.sol_address && (
          <li className="flex justify-between items-center mb-1">
            <span className="font-semibold mr-1">primary sol address</span>
            <span className="flex items-center text-right">
              <span className="font-mono text-sm break-all">{hypersnapUser.verified_addresses.primary.sol_address}</span>
              <CopyClipboardIcon value={hypersnapUser.verified_addresses.primary.sol_address} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">power badge</span>
          <span className="flex items-center text-right">
            {hypersnapUser.power_badge ? 'Yes' : 'No'}
            <CopyClipboardIcon value={(hypersnapUser.power_badge ?? false) ? 'Yes' : 'No'} className="ml-1 flex-shrink-0" />
          </span>
        </li>

        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">pro subscriber</span>
          <span className="flex items-center text-right">
            {hypersnapUser.pro?.status === 'subscribed' ? 'Yes' : 'No'}
            <CopyClipboardIcon value={hypersnapUser.pro?.status === 'subscribed' ? 'Yes' : 'No'} className="ml-1 flex-shrink-0" />
          </span>
        </li>

        {hypersnapUser.profile?.location?.address && (
          <li className="flex justify-between items-center mb-1">
            <span className="font-semibold mr-1">location</span>
            <span className="flex items-center text-right">
              {hypersnapUser.profile.location.address.city}, {hypersnapUser.profile.location.address.state}
              <CopyClipboardIcon value={`${hypersnapUser.profile.location.address.city}, ${hypersnapUser.profile.location.address.state}`} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        {(hypersnapUser.score !== undefined || hypersnapUser.experimental?.neynar_user_score !== undefined) && (
          <li className="flex justify-between items-center mb-1">
            <span className="font-semibold mr-1">Hypersnap score</span>
            <span className="flex items-center text-right">
              {(hypersnapUser.score !== undefined ? hypersnapUser.score : hypersnapUser.experimental?.neynar_user_score)?.toFixed(2)}
              <CopyClipboardIcon value={(hypersnapUser.score !== undefined ? hypersnapUser.score : hypersnapUser.experimental?.neynar_user_score)?.toString() || ''} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        {hypersnapUser.verified_accounts && hypersnapUser.verified_accounts.length > 0 && (
          hypersnapUser.verified_accounts.map((account, index) => (
            <li key={index} className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">verified {account.platform} account</span>
              <span className="flex items-center text-right">
                {account.username}
                <CopyClipboardIcon value={account.username} className="ml-1 flex-shrink-0" />
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
