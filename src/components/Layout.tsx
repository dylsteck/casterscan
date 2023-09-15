/* eslint-disable @next/next/google-font-display */
/* eslint-disable @next/next/no-page-custom-font */
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
        <meta name="description" content="A block explorer for Farcaster" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://casterscan.com/"/>
        <meta property="og:title" content="Casterscan"/>
        <meta property="og:description" content="A block explorer for Farcaster"/>
        <meta property="og:image" content="https://i.imgur.com/KJ7qfro.png"/>
        <meta property="og:site_name" content="Casterscan" />
        <meta property="og:locale" content="en_US" />
         {/* Casterscan Logo image: https://i.imgur.com/zRcK62L.png */ }
         { /* Castercan Logo w Wordmark(og:image): https://i.imgur.com/KJ7qfro.png */ }
         {/* Casterscan Screenshot image: https://i.imgur.com/mbKEweW.png */ }

        { /* PWA Setup */ }
          <meta name="application-name" content="Casterscan" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Casterscan" />
          <meta name="description" content="A block explorer for Farcaster" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-config" content="/icons/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#2B5797" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#000000" />
          <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />

          <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
          {/* TODO: Check if next-pwa _needs_ Roboto import */}

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content="https://casterscan.com/" />
          <meta name="twitter:title" content="Casterscan" />
          <meta name="twitter:description" content="A block explorer for Farcaster" />
          <meta name="twitter:image" content="https://i.imgur.com/KJ7qfro.png" />
          <meta name="twitter:creator" content="@Dylan_Steck" />
      </Head>
      <main className="bg-white w-[100vw] min-h-[100vh] h-auto overflow-y-hidden">
        <Header />
        {children}
      </main>
    </>
  )
}