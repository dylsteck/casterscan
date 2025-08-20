import recasterIcon from '@/public/apps/recaster-icon.png';

export default function RecasterIcon({ className }: { className?: string }) {
  return (
    <img
      src={recasterIcon.src}
      alt="Recaster Icon"
      className={`size-7 ${className || ''} rounded-md`}
    />
  );
}
