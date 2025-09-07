'use client'

import React from 'react';
import { useQueryState, parseAsStringLiteral } from 'nuqs';
import { SignerDetail } from '../signer-detail';
import { AppDetailView } from '../app-detail-view';
import { ProfileHeader } from './profile-header';
import { ProfileTabs } from './profile-tabs';
import { ProfileOverview } from './profile-overview';
import { ProfileAddresses } from './profile-addresses';
import { ProfileSigners } from './profile-signers';
import { ProfileRawData } from './profile-raw-data';
import { NeynarV2User, ProfileKeysPage } from '../../../lib/types';
import { useAppsWithSigners } from '../../../hooks/use-apps-with-signers';

export default function ProfileDetails({ fid, neynarUser, keysData }: { fid: string, neynarUser: NeynarV2User, keysData: ProfileKeysPage }) {
  const [activeTab, setActiveTab] = useQueryState('tab', parseAsStringLiteral(['overview', 'addresses', 'signers', 'rawdata']).withDefault('overview'));
  const [selectedSignerKey, setSelectedSignerKey] = useQueryState('signer');
  const [selectedAppFid, setSelectedAppFid] = useQueryState('signer_fid');
  const { data: appsWithSigners, isLoading: appsLoading, error: appsError } = useAppsWithSigners(fid);

  const selectedApp = appsWithSigners?.find(app => app.fid.toString() === selectedAppFid) || null;

  const totalStats = appsWithSigners ? {
    casts: appsWithSigners.reduce((sum, app) => sum + (app.appStats?.casts || 0), 0),
    reactions: appsWithSigners.reduce((sum, app) => sum + (app.appStats?.reactions || 0), 0),
    links: appsWithSigners.reduce((sum, app) => sum + (app.appStats?.links || 0), 0),
    verifications: appsWithSigners.reduce((sum, app) => sum + (app.appStats?.verifications || 0), 0),
  } : null;

  if (selectedSignerKey && selectedApp) {
    return (
      <SignerDetail 
        signerKey={selectedSignerKey} 
        fid={fid} 
        onBack={() => setSelectedSignerKey(null)}
        appInfo={{
          name: selectedApp.profile?.display_name || selectedApp.profile?.username || `App ${selectedApp.fid}`,
          username: selectedApp.profile?.username,
          bio: selectedApp.profile?.profile?.bio?.text,
          pfpUrl: selectedApp.profile?.pfp_url
        }}
      />
    );
  }

  if (selectedApp) {
    return (
      <AppDetailView 
        app={selectedApp} 
        fid={fid} 
        onBack={() => setSelectedAppFid(null)}
        userProfile={{
          username: neynarUser.username,
          fid: neynarUser.fid.toString()
        }}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-4">
        <ProfileHeader 
          neynarUser={neynarUser}
          appsLoading={appsLoading}
          totalStats={totalStats}
        />

        <div className="w-full">
          <ProfileTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          {activeTab === 'overview' && (
            <ProfileOverview neynarUser={neynarUser} />
          )}
          
          {activeTab === 'addresses' && (
            <ProfileAddresses neynarUser={neynarUser} appsWithSigners={appsWithSigners} />
          )}
          
          {activeTab === 'signers' && (
            <ProfileSigners 
              appsWithSigners={appsWithSigners}
              appsLoading={appsLoading}
              appsError={appsError}
              onAppSelect={setSelectedAppFid}
            />
          )}
          
          {activeTab === 'rawdata' && (
            <ProfileRawData neynarUser={neynarUser} />
          )}
        </div>
      </div>
    </div>
  );
}
