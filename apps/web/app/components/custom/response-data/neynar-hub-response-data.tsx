'use client';

import { useState } from "react";
import ResponseData from ".";
import { useNeynarHubCast } from "../../../hooks/use-api-data";

export default function NeynarHubResponseData({ fid, hash }: { fid: number, hash: string }) {
    const [enabled, setEnabled] = useState(false);
    const { data, isLoading, error } = useNeynarHubCast(fid, hash, { enabled });

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
            title="neynar hub"
            onOpen={() => setEnabled(true)}
        />
    );
}