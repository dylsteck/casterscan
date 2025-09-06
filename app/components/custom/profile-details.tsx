'use client'

import React, { useState } from 'react';
import CopyClipboardIcon from '@/app/components/custom/copy-clipboard-icon';
import { SignerDetail } from './signer-detail';
import { AppDetailView } from './app-detail-view';
import { NeynarV2User, ProfileKeysPage } from '../../lib/types';
import { useAppsWithSigners } from '../../hooks/use-apps-with-signers';
import { formatSignerStats, timeAgo, AppWithSigners } from '../../lib/signer-helpers';

export default function ProfileDetails({ fid, neynarUser, keysData }: { fid: string, neynarUser: NeynarV2User, keysData: ProfileKeysPage }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSigner, setSelectedSigner] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<AppWithSigners | null>(null);
  const { data: appsWithSigners, isLoading: appsLoading, error: appsError } = useAppsWithSigners(fid);

  const totalStats = appsWithSigners ? {
    casts: appsWithSigners.reduce((sum, app) => sum + (app.appStats?.casts || 0), 0),
    reactions: appsWithSigners.reduce((sum, app) => sum + (app.appStats?.reactions || 0), 0),
    links: appsWithSigners.reduce((sum, app) => sum + (app.appStats?.links || 0), 0),
    verifications: appsWithSigners.reduce((sum, app) => sum + (app.appStats?.verifications || 0), 0),
  } : null;

  if (selectedSigner) {
    return (
      <SignerDetail 
        signerKey={selectedSigner} 
        fid={fid} 
        onBack={() => setSelectedSigner(null)} 
      />
    );
  }

  if (selectedApp) {
    return (
      <AppDetailView 
        app={selectedApp} 
        fid={fid} 
        onBack={() => setSelectedApp(null)} 
      />
    );
  }
  const tabs = [
    { id: 'overview', label: 'overview' },
    { id: 'addresses', label: 'addresses' },
    { id: 'signers', label: 'signers' },
    { id: 'raw', label: 'raw data' }
  ];

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-4">
        <div className="flex items-center gap-4 mt-6 mb-4">
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

        <div className="w-full">
          <div className="flex border border-black mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-r border-black last:border-r-0 flex-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {activeTab === 'overview' && (
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
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">power badge</span>
                  <span className="flex items-center text-right">
                    {neynarUser.power_badge ? 'Yes' : 'No'}
                    <CopyClipboardIcon value={neynarUser.power_badge.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>

                {neynarUser.verified_accounts && neynarUser.verified_accounts.length > 0 && (
                  <li className="flex justify-between items-start mb-1">
                    <span className="font-semibold mr-1">verified accounts</span>
                    <div className="flex flex-col items-end">
                      {neynarUser.verified_accounts.map((account, index) => (
                        <div key={index} className="flex items-center text-right mb-1">
                          <span className="text-sm">{account.platform}: {account.username}</span>
                          <CopyClipboardIcon value={`${account.platform}: ${account.username}`} className="ml-1 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {activeTab === 'addresses' && (
            <div className="p-2 border border-black">
              {((keysData.authAddresses && keysData.authAddresses.length > 0) || (neynarUser.verified_addresses && neynarUser.verified_addresses.eth_addresses.length > 0) || (neynarUser.verified_addresses && neynarUser.verified_addresses.sol_addresses && neynarUser.verified_addresses.sol_addresses.length > 0)) ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-1 font-semibold">address</th>
                        <th className="text-left py-1 font-semibold">type</th>
                        <th className="text-left py-1 font-semibold">state</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {neynarUser.verified_addresses?.eth_addresses?.map((address, index) => (
                        <tr key={`verified-eth-${index}`} className="border-b border-gray-100">
                          <td className="py-1 font-mono text-sm break-all">{address}</td>
                          <td className="py-1">
                            <span className="text-blue-600 font-medium">Verified</span>
                          </td>
                          <td className="py-1">Active</td>
                          <td className="py-1">
                            <CopyClipboardIcon value={address} className="flex-shrink-0" />
                          </td>
                        </tr>
                      ))}
                      {neynarUser.verified_addresses?.sol_addresses?.map((address, index) => (
                        <tr key={`verified-sol-${index}`} className="border-b border-gray-100">
                          <td className="py-1 font-mono text-sm break-all">{address}</td>
                          <td className="py-1">
                            <span className="text-blue-600 font-medium">Verified</span>
                          </td>
                          <td className="py-1">Active</td>
                          <td className="py-1">
                            <CopyClipboardIcon value={address} className="flex-shrink-0" />
                          </td>
                        </tr>
                      ))}
                      {keysData.authAddresses?.map((address, index) => (
                        <tr key={`auth-${index}`} className="border-b border-gray-100">
                          <td className="py-1 font-mono text-sm break-all">{address}</td>
                          <td className="py-1">
                            <span className="text-green-600 font-medium">Auth</span>
                          </td>
                          <td className="py-1">Active</td>
                          <td className="py-1">
                            <CopyClipboardIcon value={address} className="flex-shrink-0" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No addresses found.</p>
              )}
            </div>
          )}
          
          {activeTab === 'signers' && (
            <div className="p-2 border border-black">
              {appsLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                </div>
              ) : appsError ? (
                <p className="text-red-600">Failed to load signers data</p>
              ) : appsWithSigners && appsWithSigners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appsWithSigners.map((app, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedApp(app)}
                      className="text-left p-2 border border-black hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {app.profile?.pfp_url && (
                          <img src={app.profile.pfp_url} alt="App" className="w-6 h-6 rounded-full" />
                        )}
                        <div>
                          <div className="font-semibold">
                            {app.profile?.display_name || app.profile?.username || 'Unknown App'}
                          </div>
                          <div className="text-gray-500 text-sm">
                            @{app.profile?.username || 'unknown'}
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
                        <div>{app.signers.length} signers</div>
                        <div className="text-gray-500">
                          {app.lastUsed ? (
                            <div>Last used {timeAgo(app.lastUsed)} ago</div>
                          ) : (
                            <div>Never used</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No apps with signers found for this FID.</p>
              )}
            </div>
          )}
          
          {activeTab === 'raw' && (
            <div className="p-2 border border-black">
              <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-2 font-mono whitespace-pre-wrap break-words">
                <code>{JSON.stringify(neynarUser, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
