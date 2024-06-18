import supercastIcon from '@/public/supercastIcon.png';

export default function SupercastIcon({ className }: { className?: string }) {
  return (
    <img
      src={supercastIcon.src}
      alt="Supercast Icon"
      className={`w-7 h-7 ${className ? className : ''}`}
    />
  );
};