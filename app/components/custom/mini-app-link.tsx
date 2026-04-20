'use client';

import sdk from "@farcaster/miniapp-sdk";
import { useMiniAppContext } from "./mini-app-provider";

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
    <a
      href={href}
      target='_blank'
      rel="noreferrer noopener"
      className={`${className} cursor-pointer`}
    >
      {children}
    </a>
  );
}
