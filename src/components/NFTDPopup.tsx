import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { NFTDData } from '~/types/nftd.t';
import nftdIcon from '../../public/nftdIcon.png';
import Image from 'next/image';

interface NFTDPopupProps {
  nftdData: NFTDData[];
  handleClose: () => void;
}

const PopupRow = ({ nftd }: { nftd: NFTDData }) => {
  console.log(nftd);
  return <div></div>;
};

const NFTDPopup = ({ nftdData, handleClose }: NFTDPopupProps) => {
  useEffect(() => {
    // Prevent scrolling when the modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      // Re-enable scrolling when the modal is closed
      document.body.style.overflow = 'auto';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Image src={nftdIcon} width={100 / 1.3} height={43 / 1.3} alt="NF.TD icon" className="mr-4" />
          <p className="cursor-pointer" onClick={handleClose}>Close</p>
        </div>
        {nftdData.map((nftd: NFTDData) => (
          <PopupRow nftd={nftd} key={nftd.id} />
        ))}
      </div>
    </div>,
    document.body
  );
};

export default NFTDPopup;