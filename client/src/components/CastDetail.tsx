import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CopyButton } from './CopyButton'
import { SERVER_URL } from '@/lib/constants'
import type { NeynarV2Cast } from 'shared/dist'

interface CastDetailProps {
  hash: string;
}

async function fetchCast(hash: string): Promise<NeynarV2Cast> {
  const response = await fetch(`${SERVER_URL}/api/casts/${hash}`)
  if (!response.ok) {
    throw new Error('Failed to fetch cast')
  }
  return response.json()
}

export function CastDetail({ hash }: CastDetailProps) {
  const { data: neynarCast, isLoading, error } = useQuery({
    queryKey: ['cast', hash],
    queryFn: () => fetchCast(hash),
  })

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold mb-4">Loading cast...</h1>
        </div>
      </div>
    )
  }

  if (error || !neynarCast) {
    return (
      <div className="w-full">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold mb-4">Error loading cast</h1>
          <p className="text-red-600">Failed to load cast with hash: {hash}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <p className="text-xl font-semibold mt-3">cast details</p>
        <div className="p-2 border border-black relative" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
          <div className="flex items-center mb-1">
            <img src={neynarCast.author.pfp_url} alt={`${neynarCast.author.username}'s PFP`} className="w-8 h-8 rounded-full mr-1" />
            <div>
              <p className="text-lg font-semibold">{neynarCast.author.display_name}</p>
              <p className="text-sm text-gray-500">@{neynarCast.author.username}</p>
            </div>
          </div>
          <div className="flex justify-between items-start mb-1">
            <span className="font-semibold mr-1">cast text</span>
            <div className="flex items-center justify-end max-w-[90%] break-words overflow-hidden w-auto">
              <span className="flex-grow text-right">{neynarCast.text}</span>
              <CopyButton value={neynarCast.text} className="ml-1 flex-shrink-0" />
            </div>
          </div>
          <ul className="list-none mt-1">
            {neynarCast.embeds && neynarCast.embeds
              .filter((embed: { url?: string }) => embed.url && embed.url !== "N/A")
              .map((embed: { url: string }, index: number) => (
                <li key={`embed-${index}`} className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">{`embed ${index + 1}`}</span>
                  <div className="flex items-center justify-end text-right w-full">
                    <a href={embed.url} className="underline text-wrap max-w-[65%] break-all" target="_blank" rel="noopener noreferrer">
                      {embed.url}
                    </a>
                    <CopyButton value={embed.url} className="ml-1 flex-shrink-0" />
                  </div>
                </li>
              ))}
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">cast hash</span>
              <span className="flex items-center text-right">
                {neynarCast.hash}
                <CopyButton value={neynarCast.hash} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">parent cast hash</span>
              <span className="flex items-center text-right">
                {neynarCast.thread_hash}
                <CopyButton value={neynarCast.thread_hash} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">username</span>
              <span className="flex items-center text-right">
                <Link to="/usernames/$username" params={{ username: neynarCast.author.username }} className="underline">
                  {neynarCast.author.username}
                </Link>
                <CopyButton value={neynarCast.author.username} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">fid</span>
              <span className="flex items-center text-right">
                <Link to="/fids/$fid" params={{ fid: neynarCast.author.fid.toString() }} className="underline">
                  {neynarCast.author.fid}
                </Link>
                <CopyButton value={neynarCast.author.fid.toString()} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">app name</span>
              <span className="flex items-center text-right">
                <div className="flex flex-row gap-1.5 items-center">
                  <img src={neynarCast.app.pfp_url} className="size-4 rounded-full" alt={`PFP for ${neynarCast.app.display_name}`} />
                  <span>
                    {neynarCast.app.display_name}
                  </span>
                </div>
                <CopyButton value={neynarCast.app.display_name} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">app fid</span>
              <span className="flex items-center text-right">
                <Link to="/fids/$fid" params={{ fid: neynarCast.app.fid.toString() }} className="underline">
                  {neynarCast.app.fid}
                </Link>
                <CopyButton value={neynarCast.app.fid.toString()} className="ml-1 flex-shrink-0" />
              </span>
            </li>
            <li className="flex justify-between items-center mb-1">
              <span className="font-semibold mr-1">timestamp</span>
              <span className="flex items-center text-right">
                {new Date(neynarCast.timestamp).toLocaleString()}
                <CopyButton value={new Date(neynarCast.timestamp).toLocaleString()} className="ml-1 flex-shrink-0" />
              </span>
            </li>
          </ul>
          <p className="text-sm font-light mt-1 text-right">{neynarCast.replies.count} replies, {neynarCast.reactions.likes_count} likes, and {neynarCast.reactions.recasts_count} recasts</p>
        </div>
      </div>
    </div>
  )
}
