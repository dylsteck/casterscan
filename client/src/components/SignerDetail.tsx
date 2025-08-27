import { useState, useEffect } from 'react';
import { SERVER_URL } from '@/lib/constants';
import { CopyButton } from './CopyButton';

interface SignerMessage {
  hash: string;
  data: {
    type: string;
    timestamp: number;
    fid: number;
    castAddBody?: {
      text: string;
      embeds: any[];
      mentions: number[];
      parentCastId?: {
        fid: number;
        hash: string;
      };
    };
    reactionBody?: {
      type: string;
      targetCastId?: {
        fid: number;
        hash: string;
      };
    };
    linkBody?: {
      type: string;
      targetFid?: number;
    };
  };
  signer: string;
}

interface SignerDetailProps {
  signerKey: string;
  fid: string;
  onBack: () => void;
}

export function SignerDetail({ signerKey, fid, onBack }: SignerDetailProps) {
  const [messages, setMessages] = useState<SignerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoints = [
          `/api/hub/castsByFid?fid=${fid}`,
          `/api/hub/reactionsByFid?fid=${fid}`,
          `/api/hub/linksByFid?fid=${fid}`,
          `/api/hub/verificationsByFid?fid=${fid}`
        ];

        const responses = await Promise.all(
          endpoints.map(endpoint =>
            fetch(`${SERVER_URL}${endpoint}`)
              .then(res => res.ok ? res.json() : { messages: [] })
              .catch(() => ({ messages: [] }))
          )
        );

        const allMessages = responses.flatMap(res => res.messages || []);
        const signerMessages = allMessages.filter(msg => 
          msg.signer === signerKey || (msg.data && msg.data.signer === signerKey)
        );

        // Sort by timestamp descending
        signerMessages.sort((a, b) => {
          const aTime = a.data?.timestamp || 0;
          const bTime = b.data?.timestamp || 0;
          return bTime - aTime;
        });

        setMessages(signerMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [signerKey, fid]);

  const formatMessage = (message: SignerMessage) => {
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
      <div className="p-4">
        <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
          ← Back to signers
        </button>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
          ← Back to signers
        </button>
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
        ← Back to signers
      </button>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Signer Messages</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{signerKey.slice(0, 20)}...</span>
          <CopyButton value={signerKey} />
        </div>
        <p className="text-sm text-gray-500 mt-1">{messages.length} messages found</p>
      </div>

      {messages.length === 0 ? (
        <p className="text-gray-500">No messages found for this signer.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((message, index) => {
            const formatted = formatMessage(message);
            return (
              <div key={index} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    formatted.type === 'Cast' ? 'bg-blue-100 text-blue-800' :
                    formatted.type === 'Reaction' ? 'bg-green-100 text-green-800' :
                    formatted.type === 'Link' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatted.type}
                  </span>
                  <span className="text-xs text-gray-500">{formatted.timestamp}</span>
                </div>
                <p className="text-sm mb-1">{formatted.content}</p>
                {formatted.details && (
                  <p className="text-xs text-gray-500">{formatted.details}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400 font-mono">Hash: {message.hash?.slice(0, 16)}...</span>
                  {message.hash && <CopyButton value={message.hash} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
