import warpcastIcon from '@/public/apps/warpcast-icon.png';

export default function WarpcastIcon({ className }: { className?: string }) {
  return (
    <img
      src={warpcastIcon.src}
      alt="Warpcast Icon"
      className={`size-5 ${className ? className : ''}`}
    />
  );
};