'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrameContext } from '@/app/components/custom/frame-provider';

export default function ShareCastPage() {
  const { context, ready } = useFrameContext();
  const router = useRouter();

  useEffect(() => {
    if (ready && context?.location?.type === 'cast_share' && context.location.cast?.hash) {
      router.replace(`/casts/${context.location.cast.hash}`);
    }
  }, [ready, context?.location, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="border border-black p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center space-x-4 pt-2">
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
