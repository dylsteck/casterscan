import React from 'react';
import Image from 'next/image';

interface TableRowProps {
  field: string;
  image: boolean;
  imageUrl: string;
  imageAlt: string;
  result: string;
}

const TableRow: React.FC<TableRowProps> = ({ field, image, imageUrl, imageAlt, result }) => {
  return (
    <>
      <div className="w-[100%] border-t border-white relative mt-[2.5vh]"></div>
      <div className="flex justify-between items-center ml-5 mt-[2.5vh]">
        <p className="text-lg">{field}</p>
        <div className="flex items-center mr-5">
          {image && (
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={35}
              height={35}
              className="rounded-sm w-10 h-10"
            />
          )}
          <p
            className="font-medium ml-2 overflow-x-auto whitespace-nowrap"
            onClick={() => {
              navigator.clipboard.writeText(result);
            }}
          >
            {/* If result is a hash, it truncates the hash */}
            {result.length === 66 ? `${result.slice(0, 4)}...${result.slice(-4)}` : result}
          </p>
        </div>
      </div>
    </>
  );
};

export default TableRow;