import cbWalletIcon from '@/public/apps/coinbase-wallet-icon.png';

export default function CoinbaseWalletIcon({ className }: { className?: string }) {
  return (
    <img
      src={cbWalletIcon.src}
      alt="Coinbase Wallet Icon"
      className={`size-7 ${className ? className : ''}`}
    />
  );
};