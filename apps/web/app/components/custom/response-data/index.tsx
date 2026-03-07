'use client';

import { useState } from "react";
import CopyClipboardIcon from "../copy-clipboard-icon";
import { ResponsiveDialog } from "../responsive-dialog";

export default function ResponseData({ data, title, onOpen, onClose }: { data: any, title: string, onOpen?: () => void, onClose?: () => void }) {
    const [showModal, setShowModal] = useState(false);

    const handleOpen = () => {
        onOpen?.();
        setShowModal(true);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose?.();
        }
        setShowModal(open);
    };

    return (
        <>
            <button className="p-2 text-black border border-black" onClick={handleOpen}>
                {title}
            </button>
            <ResponsiveDialog
                isOpen={showModal}
                setIsOpen={handleOpenChange}
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