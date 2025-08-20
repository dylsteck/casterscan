import unofficialIcon from '@/public/apps/unofficial-icon.png';

export default function UnofficialIcon({ className }: { className?: string }) {
  return (
    <img
      src={unofficialIcon.src}
      alt="Unofficial Icon"
      className={`size-7 ${className || ''}`}
    />
  );
}
