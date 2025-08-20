'use client';

import { ClipboardIcon, CheckCircleIcon } from '@heroicons/react/20/solid';
import React from 'react';

export default function CopyClipboardIcon({ value, className }: { value: string, className?: string }) {
  const [copied, setCopied] = React.useState<boolean>(false);

  const handleCopy = async (data: string) => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  };

  return (
    copied ? (
            <CheckCircleIcon className={`w-5 h-5 text-green-500 ml-2 cursor-pointer ${className || ''}`} />
    ) : (
            <ClipboardIcon className={`w-4 h-4 text-gray-500 ml-2 cursor-pointer ${className || ''}`} onClick={() => handleCopy(value)} />
    )
  );
}
