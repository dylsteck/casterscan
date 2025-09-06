import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://snap.farcaster.xyz:3381/v1/info')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return Response.json(data)
  } catch (error) {
    console.error('Error fetching info:', error)
    return Response.json(
      { error: 'Failed to fetch info' },
      { status: 500 }
    )
  }
}
