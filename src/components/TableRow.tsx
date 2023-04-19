import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TableRowProps {
  field: string;
  image: boolean;
  imageUrl?: string;
  imageAlt?: string;
  result: string;
}

const TableRow: React.FC<TableRowProps> = ({ field, image, imageUrl, imageAlt, result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {
      console.error('Failed to copy text to clipboard');
    });
  }

  function isUrl(str:string) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  function stripUrl(url: string) {
    return url
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/$/, '');
  }


  return (
    <>
      <div className="w-[100%] border-dotted border-t-2 border-purple-900 relative "></div>
      <div className="flex justify-between items-center ml-5 my-2">
        <p className="text-sm text-gray-300">{field}</p>
        <div className="flex items-center mr-5">
          {image && (
            <Image
              src={imageUrl || ''}
              alt={imageAlt || ''}
              width={35}
              height={35}
              className="rounded-sm w-10 h-10"
            />
          )}
          <motion.div
            className="flex items-center"
            onClick={handleCopy}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >

            { isUrl(result) ? (
              <Link
                href={result}
                className="
                  font-medium text-gray-300
                  text-sm ml-2 
                  overflow-x-auto whitespace-nowrap
              ">{stripUrl(result)}</Link>
            ) : (
              field === "ENS" ? (
                <Link href={`https://rainbow.me/${result}`}
                  className="
                    font-medium text-gray-300
                    text-sm ml-2 
                    overflow-x-auto whitespace-nowrap
                ">{result}</Link>
              ) : (
                field === "Referrer" ? (
                  <Link href={`/users/${result}`}
                  className="
                    font-medium text-gray-300
                    text-sm ml-2 
                    overflow-x-auto whitespace-nowrap
                ">{result}</Link>
              )
              : (
                field === "Casted By" ? (
                  <Link href={`/users/${result.substr(1)}`}
                  className="
                    font-medium text-gray-300
                    text-sm ml-2 
                    overflow-x-auto whitespace-nowrap
                ">{result}</Link>
              ):
              (
                <p className="
                  font-medium text-gray-300
                  text-sm ml-2 
                  overflow-x-auto whitespace-nowrap
                ">{result}</p>
              ))))}
          </motion.div>
        </div>
      </div>
      {copied && (
        <motion.div
          className="bg-gray-500 rounded-md px-2 py-1 absolute top-0 right-0 mr-5 mt-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm">Copied to clipboard</p>
        </motion.div>
      )}
    </>
  );
};

export default TableRow;
