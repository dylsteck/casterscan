interface SkeletonProps {
  variant?: 'table' | 'card'
  rows?: number
}

export function Skeleton({ variant = 'card', rows = 3 }: SkeletonProps) {
  if (variant === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 px-6">
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
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      ))}
    </div>
  );
}
