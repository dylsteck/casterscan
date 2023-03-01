import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import logo from '../assets/img/casterscanIcon.png'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [input, setInput] = useState('')
  return (
    <>
      <Head>
        <title>Casterscan</title>
        <meta name="description" content="A block explorer for the Farcaster protocol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-gradient-to-r from-[#6E569C] via-[#775CAC]/90 to-[#6E569C] w-[100vw] h-[100vh]">
          {/* <nav>
              <Image className="inline-block" src={logo} width={32} height={32} alt="Casterscan logo"/>
              <p className="inline-block ml-1 text-lg font-medium align-middle">Casterscan</p>
              <input 
                className="inline-block ml-[10vw] rounded-md p-1.5 min-w-[25vw]"
                type="text" 
                placeholder="Enter cast hash/ENS/address"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
          </nav> */}

      <nav className="bg-transparent border-gray-200 px-2 sm:px-4 py-2.5 sticky top-0">
        <div className="container flex flex-wrap items-center justify-between mx-auto">
          <a href="/" className="flex items-center">
              <Image className="inline-block" src={logo} width={32} height={32} alt="Casterscan logo"/>
              <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white ml-2">Casterscan</span>
          </a>
          <div className="flex">
              <input 
                type="text" 
                id="search-navbar" 
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder="Search..."
                value={input}
                onChange={(e) => setInput(e.target.value)} />
            </div>
          </div>
        </nav>
      </main>
    </>
  )
}
