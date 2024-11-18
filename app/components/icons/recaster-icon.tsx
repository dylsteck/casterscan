import recasterIcon from '@/public/recasterIcon.png';

export default function RecasterIcon({ className }: { className?: string }) {
  return (
    <img
      src={recasterIcon.src}
      alt="Recaster Icon"
      className={`w-7 h-7 ${className ? className : ''} rounded-md`}
    />
  );
};