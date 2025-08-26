import { useSnapchainInfo } from '@/hooks/useSnapchainInfo';
import { Skeleton } from './Skeleton';

function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e12) {
    return (bytes / 1e12).toFixed(1) + 'TB';
  }
  if (bytes >= 1e9) {
    return (bytes / 1e9).toFixed(1) + 'GB';
  }
  if (bytes >= 1e6) {
    return (bytes / 1e6).toFixed(1) + 'MB';
  }
  return bytes.toString() + 'B';
}

export function StatsBoxes() {
  const { info, loading, error } = useSnapchainInfo();

  if (loading) {
    return <Skeleton variant="stats" />;
  }

  if (error || !info) {
    return (
      <div className="grid grid-cols-6 gap-0">
        <div className="col-span-6 border border-gray-300 p-4 bg-red-50 text-red-600 text-center">
          Failed to load stats: {error}
        </div>
      </div>
    );
  }

  const shard1 = info.shardInfos.find(s => s.shardId === 1);
  const shard2 = info.shardInfos.find(s => s.shardId === 2);

  return (
    <div className="grid grid-cols-6 gap-0">
      {/* Total Messages */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-xs text-gray-500 mb-1">TOTAL MESSAGES</div>
        <div className="text-lg font-semibold">{formatNumber(info.dbStats.numMessages)}</div>
      </div>

      {/* Total FIDs */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-xs text-gray-500 mb-1">TOTAL FIDS</div>
        <div className="text-lg font-semibold">{formatNumber(info.dbStats.numFidRegistrations)}</div>
      </div>

      {/* Database Size */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-xs text-gray-500 mb-1">DB SIZE</div>
        <div className="text-lg font-semibold">{formatBytes(info.dbStats.approxSize)}</div>
      </div>

      {/* Shard 1 Height */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-xs text-gray-500 mb-1">SHARD 1 HEIGHT</div>
        <div className="text-lg font-semibold">{formatNumber(shard1?.maxHeight || 0)}</div>
      </div>

      {/* Shard 2 Height */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-xs text-gray-500 mb-1">SHARD 2 HEIGHT</div>
        <div className="text-lg font-semibold">{formatNumber(shard2?.maxHeight || 0)}</div>
      </div>

      {/* Version */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-xs text-gray-500 mb-1">VERSION</div>
        <div className="text-lg font-semibold">v{info.version}</div>
      </div>
    </div>
  );
}
