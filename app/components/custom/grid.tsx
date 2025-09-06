import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import { type SnapchainEvent, type User } from '../../lib/types';
import { renderCastText } from '../../lib/utils';
import { FrameLink } from './frame-link';

const GridRow = ({ event, isFirst, isNew }: { event: SnapchainEvent; isFirst: boolean; isNew?: boolean }) => {
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    if(diffInSeconds === 0){
      return 'just now';
    }
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    }
  };

  const getEventContent = () => {
    switch (event.type) {
      case 'CAST_ADD':
        return event.text || '';
      case 'REACTION_ADD':
        return `${event.reactionType === 'REACTION_TYPE_LIKE' ? '❤️' : '🔄'} reaction`;
      case 'LINK_ADD':
        return `🔗 ${event.linkType} link`;
      case 'VERIFICATION_ADD':
        return `✅ verified ${event.address?.slice(0, 8)}...`;
      case 'ON_CHAIN_EVENT':
        return `⛓️ ${event.chainEventType} (block ${event.blockNumber})`;
      default:
        if (event.eventType?.includes('PRUNE')) {
          const pruneEvent = event as any;
          return pruneEvent.pruneMessageBody?.message?.data?.castAddBody?.text || 
                 pruneEvent.pruneMessageBody?.message?.data?.text || 
                 pruneEvent.text || 
                 'pruned content';
        }
        return `🔧 ${event.eventType || 'unknown event'}`;
    }
  };

  const getEventTypeDisplay = () => {
    switch (event.type) {
      case 'CAST_ADD':
        return 'cast';
      case 'REACTION_ADD':
        return event.reactionType === 'REACTION_TYPE_LIKE' ? 'like' : 'recast';
      case 'LINK_ADD':
        return 'follow';
      case 'VERIFICATION_ADD':
        return 'verify';
      case 'ON_CHAIN_EVENT':
        return 'onchain';
      default:
        // Convert HUB_EVENT_TYPE_* to readable names
        if (event.eventType) {
          return event.eventType
            .replace('HUB_EVENT_TYPE_', '')
            .replace('_MESSAGE', '')
            .toLowerCase()
            .replace('_', ' ');
        }
        return 'unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className={`border-b border-r border-gray-300 p-4 ${isFirst ? 'border-t-2 border-t-[#71579E]' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm">
            {getEventTypeDisplay()}
          </span>
          <span className="text-xs text-gray-600">fid: {
            event.eventType?.includes('PRUNE') && (event as any).pruneMessageBody?.message?.data?.fid 
              ? (event as any).pruneMessageBody.message.data.fid 
              : event.fid
          }</span>
        </div>
        <span className="text-xs text-gray-500">
          {getRelativeTime(event.timestamp)}
        </span>
      </div>
      
      <div className="mb-3 max-h-20 overflow-y-auto">
        <p className="text-sm">
          {event.type === 'CAST_ADD' ? renderCastText(event.text || '') : getEventContent()}
        </p>
      </div>
      
      {event.embeds && event.embeds.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-center bg-gray-400 w-8 h-8 rounded">
            <p className="text-xs text-center">{`+${event.embeds.length}`}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Link href={event.link} target={event.link.startsWith('/') ? undefined : '_blank'}>
          <p className="text-xs underline text-[#71579E]">link =&gt;</p>
        </Link>
      </div>
    </motion.div>
  );
};

const Grid = ({ events, newEvents = [] }: { events: SnapchainEvent[]; newEvents?: SnapchainEvent[] }) => {
  const newEventIds = new Set(newEvents.map(e => e.id));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-r border-gray-300">
      {events.map((event, index) => (
        <GridRow 
          event={event} 
          isFirst={index === 0} 
          key={`${event.id}-${index}`}
          isNew={newEventIds.has(event.id)}
        />
      ))}
    </div>
  );
};

export default Grid;