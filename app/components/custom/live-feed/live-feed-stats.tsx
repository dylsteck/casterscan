import { useState } from 'react';
import { Skeleton } from '../Skeleton';
import type { InfoData } from '../../../hooks/use-info';

interface LiveFeedStatsProps {
  info: InfoData | undefined;
  isLoading: boolean;
}

export function LiveFeedStats({ info, isLoading }: LiveFeedStatsProps) {
  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B'
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1000000000) {
      return (bytes / 1000000000).toFixed(1) + 'GB'
    }
    if (bytes >= 1000000) {
      return (bytes / 1000000).toFixed(1) + 'MB'
    }
    if (bytes >= 1000) {
      return (bytes / 1000).toFixed(1) + 'KB'
    }
    return bytes + 'B'
  }

  const toggleStat = (statKey: string): void => {
    setExpandedStats(prev => ({
      ...prev,
      [statKey]: !prev[statKey]
    }));
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-gray-300 p-4 bg-white">
            <div className="h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!info) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-0">
        <div className="border border-gray-300 p-4 bg-white">
          <div className="text-sm text-gray-500 mb-1">STATUS</div>
          <div className="text-xl font-semibold text-gray-400">Error</div>
        </div>
        <div className="border border-gray-300 p-4 bg-white">
          <div className="text-sm text-gray-500 mb-1">CONNECTION</div>
          <div className="text-xl font-semibold text-gray-400">Failed</div>
        </div>
        <div className="border border-gray-300 p-4 bg-white">
          <div className="text-sm text-gray-500 mb-1">RETRY</div>
          <div className="text-xl font-semibold text-gray-400">Auto</div>
        </div>
        <div className="border border-gray-300 p-4 bg-white">
          <div className="text-sm text-gray-500 mb-1">SOURCE</div>
          <div className="text-xl font-semibold text-gray-400">Snapchain</div>
        </div>
        <div className="border border-gray-300 p-4 bg-white">
          <div className="text-sm text-gray-500 mb-1">WAITING</div>
          <div className="text-xl font-semibold text-gray-400">...</div>
        </div>
        <div className="border border-gray-300 p-4 bg-white">
          <div className="text-sm text-gray-500 mb-1">VERSION</div>
          <div className="text-xl font-semibold text-gray-400">---</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex md:grid md:grid-cols-6 gap-0 overflow-x-auto scrollbar-hide">
      <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0 cursor-pointer hover:bg-gray-50" onClick={() => toggleStat('totalMessages')}>
        <div className="text-sm text-gray-500 mb-1">TOTAL MESSAGES</div>
        <div className="text-xl font-semibold text-gray-900">{expandedStats.totalMessages ? info.dbStats.numMessages.toLocaleString() : formatNumber(info.dbStats.numMessages)}</div>
      </div>
      <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0 cursor-pointer hover:bg-gray-50" onClick={() => toggleStat('totalFids')}>
        <div className="text-sm text-gray-500 mb-1">TOTAL FIDS</div>
        <div className="text-xl font-semibold text-gray-900">{expandedStats.totalFids ? info.dbStats.numFidRegistrations.toLocaleString() : formatNumber(info.dbStats.numFidRegistrations)}</div>
      </div>
      <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0 cursor-pointer hover:bg-gray-50" onClick={() => toggleStat('dbSize')}>
        <div className="text-sm text-gray-500 mb-1">DB SIZE</div>
        <div className="text-xl font-semibold text-gray-900">{expandedStats.dbSize ? `${(info.dbStats.approxSize / 1000000000).toLocaleString()} GB` : formatBytes(info.dbStats.approxSize)}</div>
      </div>
      <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0 cursor-pointer hover:bg-gray-50" onClick={() => toggleStat('shard1Height')}>
        <div className="text-sm text-gray-500 mb-1">SHARD 1 HEIGHT</div>
        <div className="text-xl font-semibold text-gray-900">{expandedStats.shard1Height ? (info.shardInfos[1]?.maxHeight || 0).toLocaleString() : formatNumber(info.shardInfos[1]?.maxHeight || 0)}</div>
      </div>
      <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0 cursor-pointer hover:bg-gray-50" onClick={() => toggleStat('shard2Height')}>
        <div className="text-sm text-gray-500 mb-1">SHARD 2 HEIGHT</div>
        <div className="text-xl font-semibold text-gray-900">{expandedStats.shard2Height ? (info.shardInfos[2]?.maxHeight || 0).toLocaleString() : formatNumber(info.shardInfos[2]?.maxHeight || 0)}</div>
      </div>
      <div className="border border-gray-300 p-4 bg-white flex-shrink-0 min-w-32 md:min-w-0">
        <div className="text-sm text-gray-500 mb-1">VERSION</div>
        <div className="text-xl font-semibold text-gray-900">{info.version}</div>
      </div>
    </div>
  );
}
