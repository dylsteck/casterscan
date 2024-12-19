'use client';

import { useState } from "react";
import CopyClipboardIcon from "../copy-clipboard-icon";
import { XCircleIcon } from '@heroicons/react/20/solid';

export default function ResponseData({ data, title }: { data: any, title: string }) {
    const [showModal, setShowModal] = useState(false);
    return (
        <>
            <button className="p-2 text-black border border-black" onClick={() => setShowModal(true)}>
                {title}
            </button>
            {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-4 rounded shadow-lg max-w-3xl w-full h-[80vh] flex flex-col justify-between">
                    <div>
                    <h2 className="text-lg font-medium mb-2">
                       {title} response
                    </h2>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs h-[65vh]">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                    </div>
                    <div className="flex flex-row justify-end items-center gap-0.5">
                        <CopyClipboardIcon value={JSON.stringify(data, null, 2)} />
                        <XCircleIcon className="w-5 h-5 text-red-500 cursor-pointer" onClick={() => setShowModal(false)} />
                    </div>
                </div>
            </div>
        )}
        </>
    );
}