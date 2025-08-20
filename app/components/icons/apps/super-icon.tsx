import superIcon from '@/public/apps/super-icon.png';

export default function SuperIcon({ className }: { className?: string }) {
  return (
    <img
      src={superIcon.src}
      alt="Super Icon"
      className={`size-7 rounded-md ${className || ''}`}
    />
  );
}
