import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function LoadingTableRow() {
  const rowAnimation = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const secondsAgo = (timestamp) => {
    const now = new Date();
    const seconds = Math.floor((now - new Date(timestamp)) / 1000);
    return `${seconds} seconds ago`;
  };

  return (
    <motion.tr
      className="bg-white font-normal"
      variants={rowAnimation}
      initial="hidden"
      animate="visible"
    >
      <th scope="row" className="px-6 py-4 whitespace-nowrap">
        {secondsAgo(new Date().toISOString())}
      </th>
      <td className="px-6 py-4 text-[#71579E]">
        Awaiting RPC request from Farcaster Network hub...
      </td>
    </motion.tr>
  );
}

export default function LoadingTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const addRow = () => {
      setRows((prevRows) => [
        ...prevRows,
        <LoadingTableRow key={prevRows.length} />,
      ]);
    };

    const timer = setInterval(addRow, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-md text-[#494949] font-normal">
          <tr>
            <th scope="col" className="px-6 py-3 font-normal">
              time
            </th>
            <th scope="col" className="px-6 py-3 font-normal">
              message
            </th>
          </tr>
        </thead>
        <tbody>
          {rows}
          <div id="bottom" />
        </tbody>
      </table>
    </div>
  );
}