import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Content, NFTDData } from '~/types/nftd.t';
import nftdIconNoDots from '../../public/nftdIconNoDots.png';
import Image from 'next/image';
import Link from 'next/link';
import { getRelativeTime } from '~/lib/time';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface NFTDPopupProps {
  nftdData: NFTDData[];
  handleClose: () => void;
}


const DataRendererRow = ({content}: {content: Content}) => {
    return(
        <tr className="bg-white">
            <th scope="row" className={`pr-6 py-4 whitespace-nowrap font-normal`}>
                {content.label}
            </th>
            <td className="pr-6 py-4 underline text-[#71579E]">
                <Link href={content.url || ''}>
                    {`link =>`}
                </Link>
            </td>
            <td className="pr-6 py-4">
                {getRelativeTime(content.timestamp)}
            </td>
        </tr>
    )
}


const DataRenderer = ({data}: {data: NFTDData}) => {
    return (
      <table className="w-[100%] text-sm text-left">
        <thead className="text-md text-[#494949]">
            <tr>
                <th scope="col" className="pr-6 py-3 font-normal">
                    name
                </th>
                <th scope="col" className="pr-6 py-3 font-normal">
                    link
                </th>
                <th scope="col" className="pr-6 py-3 font-normal">
                    time
                </th>
            </tr>
        </thead>
        <tbody>
            {data.content && data.content.filter((item) => item.type !== 'header').map((content) => {
                return <DataRendererRow content={content} key={data.content.indexOf(content)} />
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
        <div className="w-[100%] flex flex-row justify-between items-center">
          <Link href={`https://nf.td/${nftdData[0]?.slug ?? ''}`}>
            <div className="flex flex-row items-center">
              <div className="w-[60px] h-[34.5px]">
                <Image 
                  src={nftdIconNoDots}
                  width={100} height={46} alt="NF.TD icon w-[100%] h-[100%]" 
                />
              </div>
              <p className="text-lg font-medium pb-2">{nftdData[0]?.slug}</p>
            </div>
          </Link>
          <div className="ml-auto">
            <div className="flex items-center" style={{ height: '100%' }}>
              <XCircleIcon width={20} height={20} className="text-[#EA3323] cursor-pointer pb-1" onClick={handleClose} />
            </div>
          </div>
        </div>
        {nftdData[0] && <DataRenderer data={nftdData[0]} />}
      </div>
    </div>,
    document.body
  );
};

export default NFTDPopup;