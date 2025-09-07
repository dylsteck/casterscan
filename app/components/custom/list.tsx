import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import { type SnapchainEvent, type User } from '../../lib/types';
import { renderCastText } from '../../lib/utils';
import { MiniAppLink } from './mini-app-link';

const ListRow = ({ event, isNew }: { event: SnapchainEvent; isNew?: boolean }) => {
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    if(diffInSeconds === 0){
      return 'just now';
    }
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
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
    <motion.tr 
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="bg-white"
    >
      <th
        scope="row"
        className="px-2 py-2 text-[#71579E] font-normal w-20"
      >
        <span className="text-sm">
          {getEventTypeDisplay()}
        </span>
      </th>
      <td className="px-2 py-2 w-16 text-center">
        {event.eventType?.includes('PRUNE') && (event as any).pruneMessageBody?.message?.data?.fid 
          ? (event as any).pruneMessageBody.message.data.fid 
          : event.fid}
      </td>
      <td className="px-2 py-2 flex-1">
        <p className="overflow-x-scroll">
          {event.type === 'CAST_ADD' ? renderCastText(event.text || '') : getEventContent()}
        </p>
      </td>
      <td className="px-2 py-2 w-20">
        {event.embeds && event.embeds.length > 0 && (
          <div className="flex items-center justify-center bg-gray-400 w-10 h-10 ml-2">
            <p className="text-center">{`+${event.embeds.length}`}</p>
          </div>
        )}
      </td>
      <td className="px-2 py-2 w-16">
        <Link href={event.link} target={event.link.startsWith('/') ? undefined : '_blank'}>
            <p className="underline text-[#71579E]">{`link =>`}</p>
        </Link>
      </td>
      <td className="px-2 py-2 w-20">
        {getRelativeTime(event.timestamp)}
      </td>
    </motion.tr>
  );
};

const List = ({ events, newEvents = [] }: { events: SnapchainEvent[]; newEvents?: SnapchainEvent[] }) => {
  const newEventIds = new Set(newEvents.map(e => e.id));

  return (
    <div className="overflow-x-auto w-full pl-2">
      <table className="min-w-full text-sm text-left table-fixed">
        <thead className="text-md text-[#494949] font-normal">
          <tr>
            <th scope="col" className="px-2 py-2 w-20">type</th>
            <th scope="col" className="px-2 py-2 w-16">fid</th>
            <th scope="col" className="px-2 py-2 flex-1">content</th>
            <th scope="col" className="px-2 py-2 w-20">embeds</th>
            <th scope="col" className="px-2 py-2 w-16">link</th>
            <th scope="col" className="px-2 py-2 w-20">time</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <ListRow 
              event={event} 
              key={`${event.id}-${index}`}
              isNew={newEventIds.has(event.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;