'use client'

import CopyClipboardIcon from './copy-clipboard-icon';
import { useSignerMessages } from '../../hooks/use-signer-messages';

interface SignerDetailProps {
  signerKey: string;
  fid: string;
  onBack: () => void;
}

export function SignerDetail({ signerKey, fid, onBack }: SignerDetailProps) {
  const { data: messages = [], isLoading, error } = useSignerMessages(fid, signerKey);

  const formatMessage = (message: any) => {
    const timestamp = new Date((message.data?.timestamp || 0) * 1000);
    
    if (message.data?.castAddBody) {
      return {
        type: 'Cast',
        content: message.data.castAddBody.text || 'Empty cast',
        timestamp: timestamp.toLocaleString(),
        details: `${message.data.castAddBody.mentions?.length || 0} mentions, ${message.data.castAddBody.embeds?.length || 0} embeds`
      };
    } else if (message.data?.reactionBody) {
      return {
        type: 'Reaction',
        content: message.data.reactionBody.type === 'REACTION_TYPE_LIKE' ? '👍 Like' : '🔄 Recast',
        timestamp: timestamp.toLocaleString(),
        details: message.data.reactionBody.targetCastId ? `Target: ${message.data.reactionBody.targetCastId.hash.slice(0, 10)}...` : ''
      };
    } else if (message.data?.linkBody) {
      return {
        type: 'Link',
        content: message.data.linkBody.type === 'LINK_TYPE_FOLLOW' ? 'Follow' : 'Unfollow',
        timestamp: timestamp.toLocaleString(),
        details: message.data.linkBody.targetFid ? `Target FID: ${message.data.linkBody.targetFid}` : ''
      };
    } else {
      return {
        type: 'Other',
        content: 'Unknown message type',
        timestamp: timestamp.toLocaleString(),
        details: ''
      };
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-start">
        <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
          <button onClick={onBack} className="text-blue-600 hover:underline mt-3 mb-2 text-left">
            ← Back to signers
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
          <button onClick={onBack} className="text-blue-600 hover:underline mt-3 mb-2 text-left">
            ← Back to signers
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
        <button onClick={onBack} className="text-blue-600 hover:underline mt-3 mb-2 text-left">
          ← Back to signers
        </button>
        
        <p className="text-xl font-semibold">signer messages</p>
        <div className="p-2 border border-black">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded break-all">{signerKey.slice(0, 20)}...</span>
              <CopyClipboardIcon value={signerKey} />
            </div>
            <p className="text-sm text-gray-500">{messages.length} messages found</p>
          </div>

          {messages.length === 0 ? (
            <p className="text-gray-500">No messages found for this signer.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => {
                const formatted = formatMessage(message);
                return (
                  <div key={index} className="border border-gray-200 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium border ${
                        formatted.type === 'Cast' ? 'border-blue-600 text-blue-600' :
                        formatted.type === 'Reaction' ? 'border-green-600 text-green-600' :
                        formatted.type === 'Link' ? 'border-purple-600 text-purple-600' :
                        'border-gray-600 text-gray-600'
                      }`}>
                        {formatted.type}
                      </span>
                      <span className="text-xs text-gray-500">{formatted.timestamp}</span>
                    </div>
                    <p className="text-sm mb-1 break-words">{formatted.content}</p>
                    {formatted.details && (
                      <p className="text-xs text-gray-500 mb-2">{formatted.details}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">Hash: {message.hash?.slice(0, 16)}...</span>
                      {message.hash && <CopyClipboardIcon value={message.hash} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
