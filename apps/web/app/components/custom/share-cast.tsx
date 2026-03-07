"use client";
import React from 'react';
import { NeynarV2Cast } from '../../lib/types';
import { MiniAppLink } from './mini-app-link';
import { useCastLink } from '../../hooks/use-cast-link';

type ShareCastProps = {
  neynarCast: NeynarV2Cast
}

export default function ShareCast({ neynarCast }: ShareCastProps) {
  const castLink = useCastLink(neynarCast);

  return (
    <MiniAppLink href={castLink} className="text-black border border-black px-4 py-2 inline-block bg-transparent">
      view
    </MiniAppLink>
  );
}