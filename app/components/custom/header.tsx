'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { sdk } from '@farcaster/miniapp-sdk';
import { Github, Settings } from 'lucide-react';
import CasterscanIcon from './icons/casterscan-icon';
import Search from './search';
import { FrameLink } from './frame-link';
import { useFrameContext } from './frame-provider';
import { ResponsiveDialog } from './responsive-dialog';
import { SettingsForm } from './settings-form';

export default function Header() {
  const { context } = useFrameContext();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleAddMiniApp = async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      console.error('Failed to add mini app:', error);
    }
  };

  return (
    <>
      <div className="text-black flex justify-between items-center border-b-2 border-[#C1C1C1]">
        <div className="float-left flex flex-row gap-3 ml-5 items-center">
          <CasterscanIcon />
          <Link href="/">
            <p>CASTERSCAN</p>
          </Link>
        </div>
        <div className="float-right flex flex-row gap-3 p-5">
          {context && (
            <button onClick={handleAddMiniApp} className="cursor-pointer">
              <p>ADD MINIAPP</p>
            </button>
          )}
          <div className="flex flex-row gap-3 items-center">
            <Link href="https://github.com/dylsteck/casterscan" target="_blank">
              <Github className="w-5 h-5" />
            </Link>
            <Settings className="w-5 h-5 cursor-pointer" onClick={() => setSettingsOpen(true)} />
          </div>
        </div>
      </div>
      <Search />
      <ResponsiveDialog
        isOpen={settingsOpen}
        setIsOpen={setSettingsOpen}
        title="settings"
        maxWidth="max-w-md"
      >
        <SettingsForm onClose={() => setSettingsOpen(false)} />
      </ResponsiveDialog>
    </>
  );
};