import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    
    if (!fid) {
      return Response.json({ error: 'FID is required' }, { status: 400 })
    }

    // Try to fetch user data from Neynar API
    try {
      const neynarResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
        {
          headers: {
            'Accept': 'application/json',
            'api_key': process.env.NEYNAR_API_KEY || '',
          },
        }
      )

      if (neynarResponse.ok) {
        const neynarData = await neynarResponse.json()
        if (neynarData.users && neynarData.users.length > 0) {
          const user = neynarData.users[0]
          return Response.json({
            result: {
              user: {
                fid: user.fid,
                username: user.username,
                displayName: user.display_name,
                pfp: {
                  url: user.pfp_url
                }
              }
            }
          })
        }
      }
    } catch (neynarError) {
      console.warn('Neynar API failed, falling back to Hub API:', neynarError)
    }

    // Fallback to Hub API if Neynar fails
    const hubResponse = await fetch(`https://snap.farcaster.xyz:3381/v1/userDataByFid?fid=${fid}`)
    
    if (!hubResponse.ok) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hubData = await hubResponse.json()
    
    // Extract user data from Hub response
    const userData = {
      fid: parseInt(fid),
      username: null,
      displayName: null,
      pfp: { url: null }
    }

    // Parse messages to extract user data
    if (hubData.messages) {
      for (const message of hubData.messages) {
        if (message.data?.userDataBody) {
          const userDataBody = message.data.userDataBody
          switch (userDataBody.type) {
            case 'USER_DATA_TYPE_USERNAME':
              userData.username = userDataBody.value
              break
            case 'USER_DATA_TYPE_DISPLAY':
              userData.displayName = userDataBody.value
              break
            case 'USER_DATA_TYPE_PFP':
              userData.pfp.url = userDataBody.value
              break
          }
        }
      }
    }

    return Response.json({
      result: {
        user: userData
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return Response.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
