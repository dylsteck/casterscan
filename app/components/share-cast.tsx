"use client";
import React from 'react';
import { NeynarV2Cast } from '../lib/types';
import { FrameLink } from './frame-link';

type ShareCastProps = {
  neynarCast: NeynarV2Cast
}

export default function ShareCast({ neynarCast }: ShareCastProps) {
  const farcasterLink = `https://farcaster.xyz/${neynarCast.author.username}/${neynarCast?.hash}`;

  return (
    <FrameLink href={farcasterLink} className="text-black border border-black px-4 py-2 inline-block bg-transparent">
      view
    </FrameLink>
  );
}