import type { ReactNode } from 'react';
import Head from 'next/head'
import Header from './Header'

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Casterscan</title>

        <meta name="title" content="Casterscan" />
        <meta name="description" content="A block explorer for the Farcaster protocol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://casterscan.com/"/>
        <meta property="og:title" content="Casterscan"/>
        <meta property="og:description" content="A block explorer for the Farcaster network"/>
        <meta property="og:image" content="https://i.imgur.com/L4g6fCh.jpg"/>
        { /* Casterscan Logo JPG: https://i.imgur.com/O53Yr4g.png */ }

        {/* Twitter */}
        <meta property="twitter:card" content="https://i.imgur.com/L4g6fCh.jpg" />
        <meta property="twitter:url" content="https://casterscan.com/" />
        <meta property="twitter:title" content="Casterscan" />
        <meta property="twitter:description" content="A block explorer for the Farcaster network" />
        <meta property="twitter:image" content="https://i.imgur.com/L4g6fCh.jpg" />
      </Head>
      <main className="bg-gradient-to-r from-[#6E569C] via-[#775CAC]/90 to-[#6E569C] w-[100vw] min-h-[100vh] h-auto overflow-y-hidden">
        <Header />
        {children}
      </main>
    </>
  )
}
