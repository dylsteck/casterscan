'use client'

import { sdk } from "@farcaster/frame-sdk";
import React from "react";

export default function FrameProvider({ children }: { children: React.ReactNode }){
    React.useEffect(() => {
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