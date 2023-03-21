import React, { ReactNode } from 'react';
import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Header from './Header'
const inter = Inter({ subsets: ['latin'] })

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Casterscan</title>
        <meta name="description" content="A block explorer for the Farcaster protocol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-gradient-to-r from-[#6E569C] via-[#775CAC]/90 to-[#6E569C] w-[100vw] min-h-[100vh] h-auto overflow-y-hidden">
        <Header />
        {children}
      </main>
    </>
  )
}
