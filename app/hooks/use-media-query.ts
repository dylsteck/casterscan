'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const media = window.matchMedia(query);
    const updateMatches = () => setMatches(media.matches);
    
    setMatches(media.matches);
    media.addEventListener('change', updateMatches);
    
    return () => media.removeEventListener('change', updateMatches);
  }, [mounted, query]);

  return matches;
}
