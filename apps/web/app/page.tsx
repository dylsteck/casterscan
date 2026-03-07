'use client'

import { LiveFeed } from './components/custom/live-feed/live-feed'
import { Metadata } from "next"
import { frame, SEO } from "./lib/utils"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <LiveFeed />
    </main>
  )
}
