import farcasterIcon from '@/public/apps/farcaster-icon.png';

export default function FarcasterIcon({ className }: { className?: string }) {
  return (
    <img
      src={farcasterIcon.src}
      alt="Farcaster Icon"
      className={`size-5 ${className ? className : ''}`}
    />
  );
}; 