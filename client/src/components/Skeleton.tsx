interface SkeletonProps {
  variant?: 'stats' | 'table' | 'custom';
  rows?: number;
  className?: string;
}

export function Skeleton({ variant = 'custom', rows = 5, className = '' }: SkeletonProps) {
  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-6 gap-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-gray-300 p-4 bg-gray-50 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="col-span-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="col-span-5">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="col-span-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  );
}
