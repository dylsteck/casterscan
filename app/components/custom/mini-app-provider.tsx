'use client'

import { sdk } from "@farcaster/miniapp-sdk";
import type { Context } from "@farcaster/miniapp-sdk";
import React, { createContext, useState, useContext, useMemo } from "react";
import { useLogger } from "@/app/lib/axiom/client";

interface MiniAppContextType {
  context: Context.MiniAppContext | undefined;
  ready: boolean;
  getCapabilities: () => Promise<string[]>;
  canAddMiniApp: boolean;
  isInMiniApp: boolean;
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
    const [isInMiniApp, setIsInMiniApp] = useState<boolean>(false);
    const log = useLogger();

    React.useEffect(() => {
        const init = async () => {
          const isMiniApp = await sdk.isInMiniApp();
          setIsInMiniApp(isMiniApp);
          
          log.info('Mini app detection', { isInMiniApp: isMiniApp });
          
          if (isMiniApp) {
            const sdkContext = await sdk.context;
            setContext(sdkContext);
            
            log.info('Mini app context', {
              isInMiniApp: true,
              username: sdkContext.user.username,
              fid: sdkContext.user.fid,
              clientFid: sdkContext.client.clientFid,
              context: JSON.stringify(sdkContext),
            });
            
            setTimeout(() => {
              sdk.actions.ready();
              setReady(true);
            }, 500);
          } else {
            setReady(true);
          }
        }
        init()
      }, [])

    React.useEffect(() => {
      const checkCanAdd = async () => {
        if (!context) {
          setCanAddMiniApp(false);
          return;
        }
        
        if (context.client.added) {
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
      canAddMiniApp,
      isInMiniApp
    }), [context, ready, canAddMiniApp, isInMiniApp]);

    return(
        <MiniAppContext.Provider value={value}>
         {children}
        </MiniAppContext.Provider>
    )
}
