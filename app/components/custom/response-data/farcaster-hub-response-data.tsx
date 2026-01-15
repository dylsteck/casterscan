'use client';

import { useState } from "react";
import ResponseData from ".";
import { useFarcasterHubCast } from "../../../hooks/use-api-data";

export default function FarcasterHubResponseData({ fid, hash }: { fid: number, hash: string }) {
    const [enabled, setEnabled] = useState(false);
    const { data, isLoading, error } = useFarcasterHubCast(fid, hash, { enabled });

    const responseData = !enabled
        ? { idle: true }
        : isLoading
          ? { loading: true }
          : error
            ? { error: error.message }
            : data;

    return (
        <ResponseData
            data={responseData}
            title="farcaster hub"
            onOpen={() => setEnabled(true)}
        />
    );
} 