'use client';

import { useState } from "react";
import ResponseData from ".";
import { useFarcasterCast } from "../../../hooks/use-api-data";

export default function FarcasterApiResponseData({ hash }: { hash: string }) {
    const [enabled, setEnabled] = useState(false);
    const { data, isLoading, error } = useFarcasterCast(hash, { enabled });

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
            title="farcaster api"
            onOpen={() => setEnabled(true)}
        />
    );
} 