import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Content, NFTDData } from '~/types/nftd.t';
import nftdIcon from '../../public/nftdIcon.png';
import Image from 'next/image';
import Link from 'next/link';
import { getRelativeTime } from '~/lib/time';

interface NFTDPopupProps {
  nftdData: NFTDData[];
  handleClose: () => void;
}


const DataRendererRow = ({content}: {content: Content}) => {
    return(
        <tr className="bg-white">
            <th scope="row" className={`px-6 py-4 whitespace-nowrap font-normal`}>
                {content.label}
            </th>
            <td className="px-6 py-4 underline text-[#71579E]">
                <Link href={content.url || ''}>
                    {`link =>`}
                </Link>
            </td>
            <td className="px-6 py-4">
                {getRelativeTime(new Date(content.timestamp))}
            </td>
        </tr>
    )
}


const DataRenderer = ({data}: {data: NFTDData}) => {
    return (
      <table className="w-[100%] text-sm text-left">
        <thead className="text-md text-[#494949]">
            <tr>
                <th scope="col" className="px-6 py-3 font-normal">
                    name
                </th>
                <th scope="col" className="px-6 py-3 font-normal">
                    link
                </th>
                <th scope="col" className="px-6 py-3 font-normal">
                    time
                </th>
            </tr>
        </thead>
        <tbody>
            {data.content && data.content.map((content) => {
                return <DataRendererRow content={content} />
            })}
        </tbody>
      </table>
    );
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
      <div className="bg-white p-8 rounded-lg shadow-lg max-h-[75vh] overflow-y-scroll">
        <div className="flex items-center mb-4">
          <Image src={nftdIcon} width={100 / 1.3} height={43 / 1.3} alt="NF.TD icon" className="mr-4" />
          <p className="cursor-pointer" onClick={handleClose}>Close</p>
        </div>
        {nftdData && <DataRenderer data={nftdData[0]} />}
      </div>
    </div>,
    document.body
  );
};

export default NFTDPopup;