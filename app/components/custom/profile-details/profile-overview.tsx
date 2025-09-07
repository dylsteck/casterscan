'use client'

import React from 'react';
import CopyClipboardIcon from '../copy-clipboard-icon';
import { NeynarV2User } from '../../../lib/types';

interface ProfileOverviewProps {
  neynarUser: NeynarV2User;
}

export function ProfileOverview({ neynarUser }: ProfileOverviewProps) {
  return (
    <div className="p-2 border border-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
      <ul className="list-none">
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">username</span>
          <span className="flex items-center text-right">
            {neynarUser.username}
            <CopyClipboardIcon value={neynarUser.username} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">fid</span>
          <span className="flex items-center text-right">
            {neynarUser.fid}
            <CopyClipboardIcon value={neynarUser.fid.toString()} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">custody address</span>
          <span className="flex items-center text-right">
            {neynarUser.custody_address}
            <CopyClipboardIcon value={neynarUser.custody_address} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">follower count</span>
          <span className="flex items-center text-right">
            {neynarUser.follower_count.toLocaleString()}
            <CopyClipboardIcon value={neynarUser.follower_count.toString()} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">following count</span>
          <span className="flex items-center text-right">
            {neynarUser.following_count.toLocaleString()}
            <CopyClipboardIcon value={neynarUser.following_count.toString()} className="ml-1 flex-shrink-0" />
          </span>
        </li>
        {neynarUser.url && (
          <li className="flex justify-between items-start mb-1">
            <span className="font-semibold mr-1">url</span>
            <span className="flex items-center text-right max-w-[70%]">
              <a href={neynarUser.url} target="_blank" rel="noopener noreferrer" className="text-black underline break-all" title={neynarUser.url}>
                {neynarUser.url}
              </a>
              <CopyClipboardIcon value={neynarUser.url} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        <li className="flex justify-between items-start mb-1">
          <span className="font-semibold mr-1">pfp url</span>
          <span className="flex items-center text-right max-w-[70%]">
            <a href={neynarUser.pfp_url} target="_blank" rel="noopener noreferrer" className="text-black underline break-all font-mono text-sm" title={neynarUser.pfp_url}>
              {neynarUser.pfp_url}
            </a>
            <CopyClipboardIcon value={neynarUser.pfp_url} className="ml-1 flex-shrink-0" />
          </span>
        </li>

        {neynarUser.profile?.banner?.url && (
          <li className="flex justify-between items-start mb-1">
            <span className="font-semibold mr-1">banner url</span>
            <span className="flex items-center text-right max-w-[70%]">
              <a href={neynarUser.profile.banner.url} target="_blank" rel="noopener noreferrer" className="text-black underline break-all font-mono text-sm" title={neynarUser.profile.banner.url}>
                {neynarUser.profile.banner.url}
              </a>
              <CopyClipboardIcon value={neynarUser.profile.banner.url} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        {neynarUser.verified_addresses?.primary?.eth_address && (
          <li className="flex justify-between items-center mb-1">
            <span className="font-semibold mr-1">primary eth address</span>
            <span className="flex items-center text-right">
              <span className="font-mono text-sm break-all">{neynarUser.verified_addresses.primary.eth_address}</span>
              <CopyClipboardIcon value={neynarUser.verified_addresses.primary.eth_address} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        {neynarUser.verified_addresses?.primary?.sol_address && (
          <li className="flex justify-between items-center mb-1">
            <span className="font-semibold mr-1">primary sol address</span>
            <span className="flex items-center text-right">
              <span className="font-mono text-sm break-all">{neynarUser.verified_addresses.primary.sol_address}</span>
              <CopyClipboardIcon value={neynarUser.verified_addresses.primary.sol_address} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">power badge</span>
          <span className="flex items-center text-right">
            {neynarUser.power_badge ? 'Yes' : 'No'}
            <CopyClipboardIcon value={neynarUser.power_badge.toString()} className="ml-1 flex-shrink-0" />
          </span>
        </li>

        <li className="flex justify-between items-center mb-1">
          <span className="font-semibold mr-1">pro subscriber</span>
          <span className="flex items-center text-right">
            {neynarUser.pro?.status === 'subscribed' ? 'Yes' : 'No'}
            <CopyClipboardIcon value={neynarUser.pro?.status === 'subscribed' ? 'Yes' : 'No'} className="ml-1 flex-shrink-0" />
          </span>
        </li>

        {neynarUser.profile?.location?.address && (
          <li className="flex justify-between items-center mb-1">
            <span className="font-semibold mr-1">location</span>
            <span className="flex items-center text-right">
              {neynarUser.profile.location.address.city}, {neynarUser.profile.location.address.state}
              <CopyClipboardIcon value={`${neynarUser.profile.location.address.city}, ${neynarUser.profile.location.address.state}`} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        {(neynarUser.score !== undefined || neynarUser.experimental?.neynar_user_score !== undefined) && (
          <li className="flex justify-between items-center mb-1">
            <span className="font-semibold mr-1">neynar score</span>
            <span className="flex items-center text-right">
              {(neynarUser.score !== undefined ? neynarUser.score : neynarUser.experimental?.neynar_user_score)?.toFixed(2)}
              <CopyClipboardIcon value={(neynarUser.score !== undefined ? neynarUser.score : neynarUser.experimental?.neynar_user_score)?.toString() || ''} className="ml-1 flex-shrink-0" />
            </span>
          </li>
        )}

        {neynarUser.verified_accounts && neynarUser.verified_accounts.length > 0 && (
          neynarUser.verified_accounts.map((account, index) => (
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
