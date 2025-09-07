import { NextRequest } from 'next/server'
import {
  getSSLHubRpcClient,
  HubEventType,
} from '@farcaster/hub-nodejs'
import { bytesToHexString } from '@farcaster/hub-web'

// Polyfill for server environment
if (typeof global !== 'undefined' && !global.self) {
  global.self = global as any
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const customReadable = new ReadableStream({
    start(controller) {
      let isClosed = false

      // Helper function to safely enqueue data
      const safeEnqueue = (data: Uint8Array) => {
        try {
          if (!isClosed) {
            controller.enqueue(data)
          }
        } catch (error) {
          console.warn('Controller already closed, ignoring enqueue')
          isClosed = true
        }
      }

      // Start the gRPC subscription on the server side
      const startStream = async () => {
        try {
          const hubRpcEndpoint = "snap.farcaster.xyz:3383"
          const nodeClient = getSSLHubRpcClient(hubRpcEndpoint)

          console.log('Server connecting to Snapchain hub:', hubRpcEndpoint)

          // Wait for client to be ready
          nodeClient.$.waitForReady(Date.now() + 5000, async (e) => {
            if (e) {
              console.error(`Failed to connect to ${hubRpcEndpoint}:`, e)
              safeEnqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to connect' })}\n\n`))
              return
            }

            console.log(`Connected to ${hubRpcEndpoint}`)

            try {
              const subscribeResult = await nodeClient.subscribe({
                eventTypes: [HubEventType.MERGE_MESSAGE],
              })

              if (subscribeResult.isOk()) {
                const stream = subscribeResult.value

                for await (const event of stream) {
                  // Check if controller is still open before processing
                  if (isClosed) break

                  // Filter for cast messages (type 1)
                  // TODO: Add filtering for more message types
                  if (event.mergeMessageBody?.message?.data?.type === 1) {
                    const message = event.mergeMessageBody.message
                    const hash = message.hash
                    const text = message.data.castAddBody?.text
                    const fid = message.data.fid

                    if (hash && text && !isClosed) {
                      // Convert hash bytes to proper 0x hex string
                      const hexHash = bytesToHexString(hash)._unsafeUnwrap()

                      const castData = {
                        hash: hexHash,
                        fid: Number(fid),
                        text: text,
                      }

                      safeEnqueue(
                        encoder.encode(`data: ${JSON.stringify(castData)}\n\n`)
                      )
                    }
                  }
                }
              } else {
                console.error('Failed to subscribe')
                safeEnqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to subscribe' })}\n\n`))
              }
            } catch (subscribeError) {
              console.error('Subscription error:', subscribeError)
              safeEnqueue(
                encoder.encode(`data: ${JSON.stringify({ error: 'Subscription failed' })}\n\n`)
              )
            } finally {
              try {
                nodeClient.close()
              } catch (closeError) {
                console.warn('Error closing node client:', closeError)
              }
            }
          })
        } catch (error) {
          console.error('Error starting stream:', error)
          safeEnqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Connection failed' })}\n\n`)
          )
        }
      }

      startStream()
    },
    cancel() {
      console.log('Stream cancelled by client')
    }
  })

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
} 