'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrameContext } from '@/app/components/frame-provider';

export default function ShareCastPage() {
  const { context, ready } = useFrameContext();
  const router = useRouter();

  useEffect(() => {
    if (ready && context?.location) {
      const location = context.location;
      
      if (location.type === 'cast_share' && location.cast?.hash) {
        router.push(`/casts/${location.cast.hash}`);
      }
    }
  }, [ready, context, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Redirecting to cast...</p>
      </div>
    </div>
  );
}
