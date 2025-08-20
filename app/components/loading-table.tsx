import React from 'react';

function LoadingTableRow() {
  const [style, setStyle] = React.useState({
    opacity: 0,
    transform: 'translateY(20px)',
  });

  React.useEffect(() => {
    const animation: Keyframe[] = [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ];
    const timing: KeyframeAnimationOptions = {
      duration: 300,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'forwards' as FillMode,
    };
    const row = document.getElementById(`row-${Date.now()}`);
    if (row) row.animate(animation, timing);
    setStyle({ opacity: 1, transform: 'translateY(0)' });
  }, []);

  const secondsAgo = (timestamp: number) => {
    const now = new Date().getTime();
    const seconds = Math.floor((now - timestamp) / 1000);
    return `${seconds} seconds ago`;
  };

  const isoTimestamp = new Date().toISOString();
  const timestamp = Date.parse(isoTimestamp);

  return (
    <tr
      id={`row-${Date.now()}`}
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
  const [rows, setRows] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
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
