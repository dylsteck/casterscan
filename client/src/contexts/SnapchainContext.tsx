import * as React from 'react'
import { DEFAULT_SNAPCHAIN_NODE } from '@/lib/constants'

interface SnapchainContextType {
  nodeUrl: string
  setNodeUrl: (url: string) => void
}

const SnapchainContext = React.createContext<SnapchainContextType | undefined>(undefined)

export function SnapchainProvider({ children }: { children: React.ReactNode }) {
  const [nodeUrl, setNodeUrl] = React.useState(() => 
    localStorage.getItem('snapchain-node') || DEFAULT_SNAPCHAIN_NODE
  )

  React.useEffect(() => {
    const handleNodeChange = (event: CustomEvent) => {
      setNodeUrl(event.detail)
    }

    window.addEventListener('snapchain-node-changed', handleNodeChange as EventListener)
    return () => window.removeEventListener('snapchain-node-changed', handleNodeChange as EventListener)
  }, [])

  return (
    <SnapchainContext.Provider value={{ nodeUrl, setNodeUrl }}>
      {children}
    </SnapchainContext.Provider>
  )
}

export function useSnapchainNode() {
  const context = React.useContext(SnapchainContext)
  if (context === undefined) {
    throw new Error('useSnapchainNode must be used within a SnapchainProvider')
  }
  return context
}
