import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function CopyText({ text}: { text: string}){
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {
      console.error('Failed to copy text to clipboard');
    });
  }
  
  return (
    <>
      <p className="text-xs" onClick={handleCopy}>{text}</p>
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
}