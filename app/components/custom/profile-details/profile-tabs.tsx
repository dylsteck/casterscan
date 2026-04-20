'use client'

import React from 'react';

interface ProfileTabsProps {
  activeTab: 'overview' | 'addresses' | 'signers' | 'rawdata';
  onTabChange: (tab: 'overview' | 'addresses' | 'signers' | 'rawdata') => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    { id: 'overview' as const, label: 'overview' },
    { id: 'addresses' as const, label: 'addresses' },
    { id: 'signers' as const, label: 'signers' },
    { id: 'rawdata' as const, label: 'raw data' }
  ];

  return (
    <div className="flex border border-black mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
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
  );
}
