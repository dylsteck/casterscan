'use client'

import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";

export default function FrameProvider({ children }: { children: React.ReactNode }){
    useEffect(() => {
        const init = async () => {
          const context = await sdk.context;
          setTimeout(() => {
            sdk.actions.ready()
          }, 500)
        }
        init()
      }, [])

    return(
        <>
         {children}
        </>
    )
}