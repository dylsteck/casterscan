'use client';

import sdk from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import { useFrameContext } from "./frame-provider";
import Link from "next/link";

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
      target='_blank'
      rel="noreferrer noopener"
      className={`${className} cursor-pointer`}
    >
      {children}
    </Link>
  );
}