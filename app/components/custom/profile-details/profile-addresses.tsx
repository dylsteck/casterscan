'use client'

import React from 'react';
import { NeynarV2User } from '../../../lib/types';
import { AppWithSigners } from '../../../lib/signer-helpers';

interface ProfileAddressesProps {
  neynarUser: NeynarV2User;
  appsWithSigners?: AppWithSigners[];
}

export function ProfileAddresses({ neynarUser, appsWithSigners }: ProfileAddressesProps) {
  const getAppName = (fid: number) => {
    const app = appsWithSigners?.find(app => app.fid === fid);
    return app?.profile?.display_name || app?.profile?.username || fid.toString();
  };
  return (
    <div className="p-2 border border-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-2 px-1 font-semibold">address</th>
            <th className="text-left py-2 px-1 font-semibold">type</th>
            <th className="text-left py-2 px-1 font-semibold">app</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-2 px-1 font-mono text-sm break-all">{neynarUser.custody_address}</td>
            <td className="py-2 px-1 text-sm">custody</td>
            <td className="py-2 px-1 text-sm"></td>
          </tr>
          
          {neynarUser.verified_addresses?.eth_addresses?.map((address, index) => (
            <tr key={`verified-eth-${index}`} className="border-b border-gray-200">
              <td className="py-2 px-1 font-mono text-sm break-all">{address}</td>
              <td className="py-2 px-1 text-sm">verified eth</td>
              <td className="py-2 px-1 text-sm"></td>
            </tr>
          ))}

          {neynarUser.verified_addresses?.sol_addresses?.map((address, index) => (
            <tr key={`verified-sol-${index}`} className="border-b border-gray-200">
              <td className="py-2 px-1 font-mono text-sm break-all">{address}</td>
              <td className="py-2 px-1 text-sm">verified sol</td>
              <td className="py-2 px-1 text-sm"></td>
            </tr>
          ))}

          {neynarUser.auth_addresses?.map((authItem, index) => (
            <tr key={`auth-${index}`} className="border-b border-gray-200">
              <td className="py-2 px-1 font-mono text-sm break-all">{authItem.address}</td>
              <td className="py-2 px-1 text-sm">auth</td>
              <td className="py-2 px-1 text-sm">
                {authItem.app?.fid ? (
                  <a href={`/fids/${authItem.app.fid}`} className="text-black cursor-pointer">
                    {getAppName(authItem.app.fid)}
                  </a>
                ) : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
