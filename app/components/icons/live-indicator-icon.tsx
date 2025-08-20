import React from 'react';

export default function LiveIndicatorIcon({ status = 'connected' }: { status?: 'connected' | 'disconnected' }) {
  const indicatorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (indicatorRef.current && status === 'connected') {
      indicatorRef.current.animate(
        [
          { opacity: 1, transform: 'scale(1)', boxShadow: '0 0 2px rgba(255, 0, 0, 0.3)' },
          { opacity: 0.25, transform: 'scale(1.2)', boxShadow: 'none' },
          { opacity: 1, transform: 'scale(1)', boxShadow: '0 0 2px rgba(255, 0, 0, 0.3)' },
        ],
        {
          duration: 3000,
          iterations: Infinity,
        },
      );
    }
  }, [status]);

  const color = status === 'connected' ? '#FF0000' : '#888888';

  return (
    <div
      ref={indicatorRef}
      className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-[#FF0000]' : 'bg-[#888888]'}`}
      style={{
        boxShadow: `0 0 2px ${color}`,
        fontWeight: '600',
      }}
    />
  );
}
