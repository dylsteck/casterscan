import Link from 'next/link';
import React from 'react';
import CopyClipboardIcon from '@/app/components/copy-clipboard-icon';
import { NeynarV2User, ProfileKeysPage } from '../lib/types';

export default function ProfileDetails({ fid, neynarUser, keysData }: { fid: string, neynarUser: NeynarV2User, keysData: ProfileKeysPage }) {
  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <p className="text-xl font-semibold mt-3">profile details</p>
        <div className="p-2 border border-black relative" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
          <div className="flex items-center mb-1">
            <img src={neynarUser.pfp_url} alt={`${neynarUser.username}'s PFP`} className="w-8 h-8 rounded-full mr-1" />
            <div>
              <p className="text-lg font-semibold">{neynarUser.display_name}</p>
              <p className="text-sm text-gray-500">@{neynarUser.username}</p>
            </div>
          </div>
          <ul className="list-none mt-1">
            {neynarUser.profile.bio.text && (
              <li className="flex justify-between items-start mb-1">
                <span className="font-semibold mr-1">bio</span>
                <div className="flex items-center justify-end max-w-[90%] break-words overflow-hidden w-auto">
                  <span className="flex-grow text-right">{neynarUser.profile.bio.text}</span>
                  <CopyClipboardIcon value={neynarUser.profile.bio.text} className="ml-1 flex-shrink-0" />
                </div>
              </li>
            )}
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

            {neynarUser.verified_accounts.length > 0 && (
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
        
        <div className="flex flex-col gap-2">
          <p className="text-xl font-semibold">addresses</p>
          <div className="p-2 border border-black">
            {(keysData.authAddresses.length > 0 || neynarUser.verified_addresses.eth_addresses.length > 0) ? (
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
                    {neynarUser.verified_addresses.eth_addresses.map((address, index) => (
                      <tr key={`verified-${index}`} className="border-b border-gray-100">
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
                    {keysData.authAddresses.map((address, index) => (
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
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xl font-semibold">signers</p>
          <div className="p-2 border border-black">
            {keysData.signerKeys.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-1 font-semibold">signer key</th>
                      <th className="text-left py-1 font-semibold">state</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {keysData.signerKeys.map((key, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-1 font-mono text-sm break-all">{key}</td>
                        <td className="py-1">Active</td>
                        <td className="py-1">
                          <CopyClipboardIcon value={key} className="flex-shrink-0" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No signer keys found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
