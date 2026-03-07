'use client';

import sdk from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import { useMiniAppContext } from "./mini-app-provider";
import Link from "next/link";

export function MiniAppLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const { context } = useMiniAppContext();

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
