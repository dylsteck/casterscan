import zapperIcon from '@/public/apps/zapper-icon.png';

export default function ZapperIcon({ className }: { className?: string }) {
  return (
    <img
      src={zapperIcon.src}
      alt="Zapper Icon"
      className={`size-7 ${className ? className : ''}`}
    />
  );
};