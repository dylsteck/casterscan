'use client';

import sdk from '@farcaster/frame-sdk';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFrameContext } from './frame-provider';

export function FrameLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const { context } = useFrameContext();

  if (context) {
    return (
      <div
        className={`${className} cursor-pointer`}
        onClick={() => sdk.actions.openUrl(href)}
      >
        {children}
      </div>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`${className} cursor-pointer`}
    >
      {children}
    </Link>
  );
}
