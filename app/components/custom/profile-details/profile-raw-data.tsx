'use client'

import React from 'react';
import CopyClipboardIcon from '../copy-clipboard-icon';
import type { HypersnapV2User } from '../../../lib/types';

interface ProfileRawDataProps {
  hypersnapUser: HypersnapV2User;
}

export function ProfileRawData({ hypersnapUser }: ProfileRawDataProps) {
  return (
    <div className="p-2 border border-black">
      <div className="relative">
        <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-2 font-mono whitespace-pre-wrap break-words">
          <code>{JSON.stringify(hypersnapUser, null, 2)}</code>
        </pre>
        <div className="absolute top-2 right-2">
          <CopyClipboardIcon value={JSON.stringify(hypersnapUser, null, 2)} className="flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
