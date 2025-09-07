'use client'

import { sdk } from "@farcaster/miniapp-sdk";
import type { Context } from "@farcaster/miniapp-sdk";
import React, { createContext, useState, useContext, useMemo } from "react";

interface MiniAppContextType {
  context: Context.MiniAppContext | undefined;
  ready: boolean;
  getCapabilities: () => Promise<string[]>;
  canAddMiniApp: boolean;
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined);

export function useMiniAppContext() {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error('useMiniAppContext must be used within a MiniAppProvider');
  }
  return context;
}

export default function MiniAppProvider({ children }: { children: React.ReactNode }){
    const [context, setContext] = useState<Context.MiniAppContext | undefined>(undefined);
    const [ready, setReady] = useState<boolean>(false);
    const [canAddMiniApp, setCanAddMiniApp] = useState<boolean>(false);

    React.useEffect(() => {
        const init = async () => {
          const sdkContext = await sdk.context;
          setContext(sdkContext);
          setTimeout(() => {
            sdk.actions.ready();
            setReady(true);
          }, 500)
        }
        init()
      }, [])

    React.useEffect(() => {
      const checkCanAdd = async () => {
        if (!context) {
          setCanAddMiniApp(false);
          return;
        }
        const capabilities = await getCapabilities();
        setCanAddMiniApp(capabilities.includes('actions.addMiniApp'));
      };
      checkCanAdd();
    }, [context]);

    const getCapabilities = async () => {
      return await sdk.getCapabilities();
    };

    const value = useMemo(() => ({
      context,
      ready,
      getCapabilities,
      canAddMiniApp
    }), [context, ready, canAddMiniApp]);

    return(
        <MiniAppContext.Provider value={value}>
         {children}
        </MiniAppContext.Provider>
    )
}
