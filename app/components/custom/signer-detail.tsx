'use client'

import { useState } from 'react';
import CopyClipboardIcon from './copy-clipboard-icon';
import { useSignerMessages } from '../../hooks/use-signer-messages';
import { SnapchainMessage, SnapchainCastMessage, SnapchainReactionMessage, SnapchainLinkMessage, SnapchainVerificationMessage } from '../../lib/snapchain';

interface SignerDetailProps {
  signerKey: string;
  fid: string;
  onBack: () => void;
  appInfo?: {
    name?: string;
    username?: string;
    bio?: string;
    pfpUrl?: string;
  };
}

export function SignerDetail({ signerKey, fid, onBack, appInfo }: SignerDetailProps) {
  const { data: allMessages = [], isLoading, error } = useSignerMessages(fid, signerKey);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 50;

  const filteredMessages = filter === 'all' 
    ? allMessages 
    : allMessages.filter(msg => {
        if (filter === 'casts') return msg.data.type === 'MESSAGE_TYPE_CAST_ADD' || msg.data.type === 'MESSAGE_TYPE_CAST_REMOVE';
        if (filter === 'reactions') return msg.data.type === 'MESSAGE_TYPE_REACTION_ADD' || msg.data.type === 'MESSAGE_TYPE_REACTION_REMOVE';
        if (filter === 'links') return msg.data.type === 'MESSAGE_TYPE_LINK_ADD' || msg.data.type === 'MESSAGE_TYPE_LINK_REMOVE';
        if (filter === 'verifications') return msg.data.type === 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS' || msg.data.type === 'MESSAGE_TYPE_VERIFICATION_REMOVE';
        return true;
      });

  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const messages = filteredMessages.slice(startIndex, startIndex + messagesPerPage);

  const filters = [
    { id: 'all', label: 'all', count: allMessages.length },
    { id: 'casts', label: 'casts', count: allMessages.filter(m => m.data.type === 'MESSAGE_TYPE_CAST_ADD' || m.data.type === 'MESSAGE_TYPE_CAST_REMOVE').length },
    { id: 'reactions', label: 'reactions', count: allMessages.filter(m => m.data.type === 'MESSAGE_TYPE_REACTION_ADD' || m.data.type === 'MESSAGE_TYPE_REACTION_REMOVE').length },
    { id: 'links', label: 'links', count: allMessages.filter(m => m.data.type === 'MESSAGE_TYPE_LINK_ADD' || m.data.type === 'MESSAGE_TYPE_LINK_REMOVE').length },
    { id: 'verifications', label: 'verifications', count: allMessages.filter(m => m.data.type === 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS' || m.data.type === 'MESSAGE_TYPE_VERIFICATION_REMOVE').length }
  ];

  function farcasterTimeToDate(time: number): Date {
    const FARCASTER_EPOCH = 1609459200;
    return new Date((FARCASTER_EPOCH + time) * 1000);
  }

  function timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
      const years = Math.floor(interval);
      return years + " year" + (years !== 1 ? "s" : "");
    }
    
    interval = seconds / 2592000;
    if (interval > 1) {
      const months = Math.floor(interval);
      return months + " month" + (months !== 1 ? "s" : "");
    }
    
    interval = seconds / 86400;
    if (interval > 1) {
      const days = Math.floor(interval);
      return days + " day" + (days !== 1 ? "s" : "");
    }
    
    interval = seconds / 3600;
    if (interval > 1) {
      const hours = Math.floor(interval);
      return hours + " hour" + (hours !== 1 ? "s" : "");
    }
    
    interval = seconds / 60;
    if (interval > 1) {
      const minutes = Math.floor(interval);
      return minutes + " minute" + (minutes !== 1 ? "s" : "");
    }
    
    const sec = Math.floor(seconds);
    return sec + " second" + (sec !== 1 ? "s" : "");
  }

  const formatMessage = (message: SnapchainMessage) => {
    const timestamp = message.data.timestamp;
    const date = farcasterTimeToDate(timestamp);
    
    if (message.data.type === 'MESSAGE_TYPE_CAST_ADD' || message.data.type === 'MESSAGE_TYPE_CAST_REMOVE') {
      const castMessage = message as SnapchainCastMessage;
      if (castMessage.data.castAddBody) {
        const castBody = castMessage.data.castAddBody;
        return {
          type: 'cast',
          content: castBody.text || 'Empty cast',
          timeAgo: timeAgo(date),
          details: castBody.parentCastId ? `replying to 0x${castBody.parentCastId.hash.slice(0, 8)}... by @!${castBody.parentCastId.fid}` : null,
          embeds: castBody.embeds || [],
          mentions: castBody.mentions || [],
          hash: message.hash,
          isCast: true
        };
      }
      return {
        type: 'cast',
        content: 'Cast removed',
        timeAgo: timeAgo(date),
        details: null,
        hash: message.hash,
        isCast: true
      };
    } else if (message.data.type === 'MESSAGE_TYPE_REACTION_ADD' || message.data.type === 'MESSAGE_TYPE_REACTION_REMOVE') {
      const reactionMessage = message as SnapchainReactionMessage;
      const reactionBody = reactionMessage.data.reactionBody;
      return {
        type: 'reaction',
        content: reactionBody.type === 'REACTION_TYPE_LIKE' ? '👍 Like' : '🔄 Recast',
        timeAgo: timeAgo(date),
        details: reactionBody.targetCastId ? `replying to 0x${reactionBody.targetCastId.hash.slice(0, 8)}... by @!${reactionBody.targetCastId.fid}` : null,
        hash: message.hash,
        isCast: false
      };
    } else if (message.data.type === 'MESSAGE_TYPE_LINK_ADD' || message.data.type === 'MESSAGE_TYPE_LINK_REMOVE') {
      const linkMessage = message as SnapchainLinkMessage;
      const linkBody = linkMessage.data.linkBody;
      return {
        type: 'link',
        content: linkBody.type === 'follow' || linkBody.type === 'LINK_TYPE_FOLLOW' ? 'Follow' : 'Unfollow',
        timeAgo: timeAgo(date),
        details: linkBody.targetFid ? `Target FID: ${linkBody.targetFid}` : null,
        hash: message.hash,
        isCast: false
      };
    } else if (message.data.type === 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS') {
      const verificationMessage = message as SnapchainVerificationMessage;
      if (verificationMessage.data.verificationAddAddressBody) {
        const verificationBody = verificationMessage.data.verificationAddAddressBody;
        return {
          type: 'verification',
          content: 'Add Address Verification',
          timeAgo: timeAgo(date),
          details: `Address: ${verificationBody.address.slice(0, 10)}...`,
          hash: message.hash,
          isCast: false
        };
      }
      return {
        type: 'verification',
        content: 'Add Address Verification',
        timeAgo: timeAgo(date),
        details: 'No address data',
        hash: message.hash,
        isCast: false
      };
    } else if (message.data.type === 'MESSAGE_TYPE_VERIFICATION_REMOVE') {
      const verificationMessage = message as SnapchainVerificationMessage;
      if (verificationMessage.data.verificationRemoveBody) {
        const verificationBody = verificationMessage.data.verificationRemoveBody;
        return {
          type: 'verification',
          content: 'Remove Address Verification',
          timeAgo: timeAgo(date),
          details: `Address: ${verificationBody.address.slice(0, 10)}...`,
          hash: message.hash,
          isCast: false
        };
      }
      return {
        type: 'verification',
        content: 'Remove Address Verification',
        timeAgo: timeAgo(date),
        details: 'No address data',
        hash: message.hash,
        isCast: false
      };
    }
    
    return {
      type: 'other',
      content: 'Unknown message type',
      timeAgo: timeAgo(date),
      details: null,
      hash: message.hash,
      isCast: false
    };
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-start">
        <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
          <button onClick={onBack} className="text-black hover:underline mt-3 mb-2 text-left">
            ← back
          </button>
          <div className="p-2 border border-black">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex justify-center items-start">
        <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
          <button onClick={onBack} className="text-black hover:underline mt-3 mb-2 text-left">
            ← back
          </button>
          <div className="p-2 border border-black">
            <p className="text-red-600">Error: {error instanceof Error ? error.message : 'Failed to load messages'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
        <button onClick={onBack} className="text-black hover:underline mt-3 mb-2 text-left">
          ← back to {appInfo?.username || appInfo?.name || `FID ${fid}`}
        </button>
        
        {appInfo && (
          <div className="flex items-center gap-4 mt-6 mb-4">
            {appInfo.pfpUrl && (
              <img src={appInfo.pfpUrl} alt={appInfo.name} className="w-16 h-16 rounded-full" />
            )}
            <div className="flex-1">
              <div className="text-2xl font-bold">{appInfo.name || `App ${fid}`}</div>
              <div className="text-gray-600">@{appInfo.username || `fid${fid}`}</div>
              {appInfo.bio && (
                <div className="text-gray-500 mt-1">{appInfo.bio}</div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <p className="text-xl font-semibold">signer messages</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-mono bg-gray-100 px-2 py-1 overflow-x-auto scrollbar-hide whitespace-nowrap max-w-xs">{signerKey}</span>
            <CopyClipboardIcon value={signerKey} />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex border border-black">
            {filters.map((filterItem) => (
              <button
                key={filterItem.id}
                onClick={() => {
                  setFilter(filterItem.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 text-sm font-medium border-r border-black last:border-r-0 flex-1 transition-colors ${
                  filter === filterItem.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {filterItem.label} ({filterItem.count.toLocaleString()})
              </button>
            ))}
          </div>
        </div>

        <div>
          {messages.length === 0 ? (
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} messages found for this signer.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {messages.map((message, index) => {
                  const formatted = formatMessage(message);
                  return (
                    <div key={index} className="border border-black p-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-black border border-black px-1 py-0.5">
                          {formatted.type}
                        </span>
                        <span className="text-xs text-gray-500">{formatted.timeAgo} ago</span>
                      </div>
                      
                      {formatted.details && (
                        <div className="text-xs text-gray-500 mb-2">{formatted.details}</div>
                      )}
                      
                      {formatted.content && (
                        <div className="text-sm mb-2 break-words">{formatted.content}</div>
                      )}
                      
                      {formatted.embeds && formatted.embeds.length > 0 && (
                        <div className="mb-2">
                          {formatted.embeds.map((embed: any, i: number) => (
                            <div key={i} className="text-xs text-gray-500">
                              {embed.url && (
                                <a href={embed.url} target="_blank" rel="noopener noreferrer" className="text-black underline break-all">
                                  {embed.url}
                                </a>
                              )}
                              {embed.castId && (
                                <span>Cast: 0x{embed.castId.hash.slice(0, 8)}... by @!{embed.castId.fid}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-xs mt-auto">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-gray-400">0x{formatted.hash?.slice(0, 6)}...</span>
                          {formatted.hash && <CopyClipboardIcon value={formatted.hash} />}
                        </div>
                        {formatted.hash && (
                          <a 
                            href={`/casts/${formatted.hash}`} 
                            className="text-black underline text-xs"
                          >
                            view
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <span className="text-sm">
                    Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
