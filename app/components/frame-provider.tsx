'use client';

import { sdk } from '@farcaster/frame-sdk';
import type { Context } from '@farcaster/frame-sdk';
import React, {
  createContext, useState, useContext, useMemo,
} from 'react';

interface FrameContextType {
  context: Context.FrameContext | undefined;
  ready: boolean;
}

const FrameContext = createContext<FrameContextType | undefined>(undefined);

export function useFrameContext() {
  const context = useContext(FrameContext);
  if (context === undefined) {
    throw new Error('useFrameContext must be used within a FrameProvider');
  }
  return context;
}

export default function FrameProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<Context.FrameContext | undefined>(undefined);
  const [ready, setReady] = useState(false);

  React.useEffect(() => {
    const init = async () => {
      const sdkContext = await sdk.context;
      setContext(sdkContext);
      setTimeout(() => {
        sdk.actions.ready();
        setReady(true);
      }, 500);
    };
    init();
  }, []);

  const value = useMemo(() => ({
    context,
    ready,
  }), [context, ready]);

  return (
        <FrameContext.Provider value={value}>
         {children}
        </FrameContext.Provider>
  );
}
