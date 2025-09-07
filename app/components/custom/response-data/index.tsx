'use client';

import { useState } from "react";
import CopyClipboardIcon from "../copy-clipboard-icon";
import { ResponsiveDialog } from "../responsive-dialog";

export default function ResponseData({ data, title }: { data: any, title: string }) {
    const [showModal, setShowModal] = useState(false);
    return (
        <>
            <button className="p-2 text-black border border-black" onClick={() => setShowModal(true)}>
                {title}
            </button>
            <ResponsiveDialog
                isOpen={showModal}
                setIsOpen={setShowModal}
                title={`${title} response`}
            >
                <div className="flex flex-col space-y-4 max-h-full">
                    <pre className="bg-gray-100 p-3 border border-black overflow-auto text-xs h-[50vh] max-h-[300px] w-full">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                    <div className="flex justify-end">
                        <CopyClipboardIcon value={JSON.stringify(data, null, 2)} />
                    </div>
                </div>
            </ResponsiveDialog>
        </>
    );
}