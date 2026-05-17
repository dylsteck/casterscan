"use client";
import React from 'react';
import type { HypersnapV2Cast } from '../../lib/types';
import { MiniAppLink } from './mini-app-link';
import { useCastLink } from '../../hooks/use-cast-link';

type ShareCastProps = {
  hypersnapCast: HypersnapV2Cast;
};

export default function ShareCast({ hypersnapCast }: ShareCastProps) {
  const castLink = useCastLink(hypersnapCast);

  return (
    <MiniAppLink href={castLink} className="text-black border border-black px-4 py-2 inline-block bg-transparent">
      view
    </MiniAppLink>
  );
}