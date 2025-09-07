import { NextRequest } from 'next/server'
import { SNAPCHAIN_NODE_BASE_URL, CACHE_TTLS } from '../../../lib/utils';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${SNAPCHAIN_NODE_BASE_URL}:3381/v1/info`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return Response.json(data, {
      headers: {
        'Cache-Control': `max-age=${CACHE_TTLS.LONG}`
      }
    })
  } catch (error) {
    console.error('Error fetching info:', error)
    return Response.json(
      { error: 'Failed to fetch info' },
      { status: 500 }
    )
  }
}
