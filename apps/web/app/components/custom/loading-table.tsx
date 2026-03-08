import React from 'react';

interface LoadingRow {
  id: number;
  timestamp: number;
}

function LoadingTableRow({ timestamp }: { timestamp: number }) {
  const [style, setStyle] = React.useState({
    opacity: 0,
    transform: "translateY(20px)",
  });
  const rowRef = React.useRef<HTMLTableRowElement>(null);

  React.useEffect(() => {
    const animation: Keyframe[] = [
      { opacity: 0, transform: "translateY(20px)" },
      { opacity: 1, transform: "translateY(0)" },
    ];
    const timing: KeyframeAnimationOptions = {
      duration: 300,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      fill: "forwards" as FillMode,
    };
    const row = rowRef.current;
    if (row) row.animate(animation, timing);
    setStyle({ opacity: 1, transform: "translateY(0)" });
  }, []);

  const secondsAgo = (timestamp: number) => {
    const now = new Date().getTime();
    const seconds = Math.floor((now - timestamp) / 1000);
    return `${seconds} seconds ago`;
  };

  return (
    <tr
      ref={rowRef}
      className="bg-white font-normal"
      style={style}
    >
      <th scope="row" className="px-6 py-4 whitespace-nowrap">
        {secondsAgo(timestamp)}
      </th>
      <td className="px-6 py-4 text-[#71579E]">
        Awaiting request from Farcaster protocol hubs...
      </td>
    </tr>
  );
}

export default function LoadingTable() {
  const [rows, setRows] = React.useState<LoadingRow[]>([]);

  React.useEffect(() => {
    const addRow = () => {
      setRows((prevRows) => [
        ...prevRows,
        {
          id: prevRows.length,
          timestamp: Date.now(),
        },
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
          {rows.map((row) => (
            <LoadingTableRow key={row.id} timestamp={row.timestamp} />
          ))}
          <div id="bottom" />
        </tbody>
      </table>
    </div>
  );
}